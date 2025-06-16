
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export type UserRole = 'teacher' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, roles, error, retry } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
    }, 15000); // 15 second timeout for ProtectedRoute

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Don't do anything while loading (unless timeout reached or there's an error)
    if (loading && !timeoutReached && !error) return;

    console.log('ProtectedRoute: Checking access - user:', !!user, 'loading:', loading, 'roles:', roles, 'error:', error);

    // If there's an error, don't redirect
    if (error) return;

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
  }, [user, loading, navigate, requiredRoles, roles, timeoutReached, error]);

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-lg mb-4 text-red-600">Authentication Error</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          <div className="space-x-4">
            <Button onClick={retry} className="bg-blue-500 hover:bg-blue-600">
              Retry
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Connecting to authentication service</div>
        </div>
      </div>
    );
  }

  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Loading took too long</div>
          <div className="text-sm text-gray-600 mb-6">The authentication service may be experiencing issues.</div>
          <div className="space-x-4">
            <Button onClick={retry} className="bg-blue-500 hover:bg-blue-600">
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
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
