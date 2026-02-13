import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
const PublicRoute = () => {
    const isAuthenticated = Cookies.get('access_token')
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

export default PublicRoute;
