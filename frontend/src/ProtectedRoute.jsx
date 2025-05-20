import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>;
  }
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!user || user.rol !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
