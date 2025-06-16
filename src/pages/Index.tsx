
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, roles, error } = useAuth();

  useEffect(() => {
    console.log('Index: Auth state - user:', !!user, 'loading:', loading, 'roles:', roles, 'error:', error);
    
    // Only redirect if we have a user, session, and roles, and we're not loading
    if (!loading && user && roles.length > 0) {
      console.log('Index: Authenticated user detected, redirecting to dashboard');
      if (roles.includes('admin')) {
        navigate('/admin-dashboard', { replace: true });
      } else if (roles.includes('teacher')) {
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [user, loading, roles, navigate, error]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-lg mb-4 text-red-600">Connection Error</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          <Button 
            onClick={() => navigate("/auth")} 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Don't show onboarding if user is authenticated (even without roles)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Setting up your account...</div>
          <div className="text-sm text-gray-500">Please wait while we prepare your dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Wave Background */}
      <div className="absolute inset-0 w-full h-full">
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-60"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,400 C300,200 600,600 900,300 C1050,150 1200,500 1200,400 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-40"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,500 C200,300 500,700 800,400 C950,250 1200,600 1200,500 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-20"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,600 C400,400 700,800 1000,500 C1100,400 1200,700 1200,600 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
      </div>

      {/* Content */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl shadow-black/10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-green-700 mb-2">WISE</h1>
            <p className="text-lg text-muted-foreground">Islamic Studies Progress Tracking</p>
          </div>
          <CardTitle>Welcome to WISE</CardTitle>
          <CardDescription>Track and manage Islamic studies progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/auth")}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
