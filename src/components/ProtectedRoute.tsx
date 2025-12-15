import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
const ProtectedRoute = () => {
  const isAuthenticated = Cookies.get('access_token')

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
