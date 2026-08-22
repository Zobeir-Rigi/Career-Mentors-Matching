import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  allowedRoles?: ("MENTOR" | "MENTEE" | "ADMIN")[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRedirect =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "MENTOR"
          ? "/mentor/profile"
          : "/mentee/profile";

    return <Navigate to={defaultRedirect} replace />;
  }

  return <Outlet />;
}
