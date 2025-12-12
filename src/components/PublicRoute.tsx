import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
    const isAuthenticated = localStorage.getItem("token");
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />; 
};

export default PublicRoute;
