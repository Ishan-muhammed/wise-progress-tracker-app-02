
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export type UserRole = 'teacher' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return;

    // If no user, redirect to auth
    if (!user) {
      navigate("/auth");
      return;
    }

    // If user exists but no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's roles
      if (roles.includes('admin')) {
        navigate("/admin-dashboard");
      } else if (roles.includes('teacher')) {
        navigate("/teacher-dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate, requiredRoles, roles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If roles are required, check them
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
