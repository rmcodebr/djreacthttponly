import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return <p>Carregando...</p>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/accounts/login" />;
}
