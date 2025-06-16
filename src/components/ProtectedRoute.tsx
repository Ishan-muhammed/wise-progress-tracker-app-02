
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export type UserRole = 'teacher' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Don't do anything while loading (unless timeout reached)
    if (loading && !timeoutReached) return;

    console.log('ProtectedRoute: Checking access - user:', !!user, 'loading:', loading, 'roles:', roles);

    // If no user after loading is complete (or timeout), redirect to auth
    if (!user) {
      console.log('ProtectedRoute: No user, redirecting to auth');
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
      console.log('ProtectedRoute: Insufficient roles, redirecting based on user roles');
      // Redirect to appropriate dashboard based on user's roles
      if (roles.includes('admin')) {
        navigate("/admin-dashboard");
      } else if (roles.includes('teacher')) {
        navigate("/teacher-dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [user, loading, navigate, requiredRoles, roles, timeoutReached]);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading took too long</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
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
