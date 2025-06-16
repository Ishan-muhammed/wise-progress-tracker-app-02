
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
  const { user, loading, roles, error, retry, session } = useAuth();
  const navigate = useNavigate();
  const [gracePeriod, setGracePeriod] = useState(true);

  // Give a 2-second grace period for roles to load (reduced from 3)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGracePeriod(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't do anything while loading or during grace period
    if (loading || gracePeriod) return;

    console.log('ProtectedRoute: Checking access - user:', !!user, 'session:', !!session, 'roles:', roles, 'error:', error);

    // If there's an error, don't redirect immediately - let the user see the error
    if (error) {
      console.log('ProtectedRoute: Error detected, showing error state');
      return;
    }

    // If no user and no session after loading is complete, redirect to auth
    if (!user && !session) {
      console.log('ProtectedRoute: No user or session, redirecting to auth');
      navigate("/auth", { replace: true });
      return;
    }

    // If user exists but no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('ProtectedRoute: No roles required, allowing access');
      return;
    }

    // If we have a user/session but still no roles after grace period, 
    // allow access anyway to prevent infinite loading
    if (user && roles.length === 0) {
      console.log('ProtectedRoute: User exists but no roles found after grace period, allowing access');
      return;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole && roles.length > 0) {
      console.log('ProtectedRoute: Insufficient roles, redirecting based on user roles');
      // Redirect to appropriate dashboard based on user's roles
      if (roles.includes('admin')) {
        navigate("/admin-dashboard", { replace: true });
      } else if (roles.includes('teacher')) {
        navigate("/teacher-dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [user, session, loading, navigate, requiredRoles, roles, error, gracePeriod]);

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-lg mb-4 text-red-600">Connection Error</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          <div className="space-y-2">
            <Button onClick={retry} className="bg-blue-500 hover:bg-blue-600">
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => navigate("/auth")} 
              variant="ghost"
              className="text-sm"
            >
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || gracePeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading...</div>
          <div className="text-sm text-gray-500">
            {gracePeriod ? "Verifying permissions" : "Loading application"}
          </div>
        </div>
      </div>
    );
  }

  if (!user && !session) {
    return null;
  }

  // If roles are required, check them (but allow access if no roles after grace period)
  if (requiredRoles && requiredRoles.length > 0 && roles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
