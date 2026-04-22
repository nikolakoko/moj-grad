import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}