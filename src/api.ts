import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    // headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error?.response && error?.response?.status == 498) {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            return Promise.reject(error);
        }

        if (
            error.response &&
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get("refresh_token");
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                // Call the refresh token endpoint
                const response = await axiosInstance.post("/api/auth/refresh", {
                    refresh_token: refreshToken,
                });

                if (response.data.success) {
                    const { access_token, refresh_token } = response.data;

                    // Update cookies with new tokens
                    Cookies.set("access_token", access_token);
                    if (refresh_token) {
                        Cookies.set("refresh_token", refresh_token);
                    }

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error("Token refresh failed");
                }
            } catch (refreshError) {
                // Token refresh failed, clear cookies and redirect
                Cookies.remove("access_token");
                Cookies.remove("refresh_token");
                if (typeof window !== "undefined") {
                    window.location.href = "/";
                }
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;