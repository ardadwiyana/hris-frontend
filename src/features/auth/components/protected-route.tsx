import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import type { Role } from "@/constants/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Guards nested routes: redirects to /login when unauthenticated, and to
 * /dashboard when authenticated but the user's role isn't allowed.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
