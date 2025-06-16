
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, error, retry, roles } = useAuth();
  const [debugInfo, setDebugInfo] = useState(false);

  useEffect(() => {
    console.log('Login page - User:', !!user, 'Loading:', loading, 'Roles:', roles, 'Error:', error);
    
    // If user exists and has roles, navigate appropriately
    if (!loading && user && roles.length > 0) {
      console.log('Login: User detected with roles, navigating...');
      const timeoutId = setTimeout(() => {
        if (roles.includes('admin')) {
          console.log('Forcing navigation to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else if (roles.includes('teacher')) {
          console.log('Forcing navigation to teacher dashboard');
          navigate('/teacher-dashboard', { replace: true });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, roles, navigate, error]);

  // Show error state with retry option
  if (error) {
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
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl shadow-black/10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-green-700 mb-2">WISE</h1>
              <p className="text-lg text-muted-foreground">Islamic Studies Progress Tracking</p>
            </div>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={retry} className="w-full">
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              Refresh Page
            </Button>
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")} 
                className="text-sm"
              >
                Go to Login Page
              </Button>
            </div>
            {/* Debug Information */}
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setDebugInfo(!debugInfo)} 
                className="text-xs text-gray-500"
              >
                Show Debug Info
              </Button>
            </div>
            {debugInfo && (
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                <p>User: {user ? 'Yes' : 'No'}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Roles: {roles.join(', ') || 'None'}</p>
                <p>Error: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Initializing application</div>
          <div className="mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setDebugInfo(!debugInfo)}
              className="text-xs"
            >
              Debug Info
            </Button>
            {debugInfo && (
              <div className="text-xs text-gray-600 mt-2">
                <p>User: {user ? 'Found' : 'None'}</p>
                <p>Roles: {roles.length} roles</p>
                <p>Path: {window.location.pathname}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If user exists but still on login page, show redirecting message with manual options
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">Redirecting to dashboard...</div>
          <div className="space-y-2">
            {roles.includes('admin') && (
              <Button 
                onClick={() => navigate('/admin-dashboard')}
                className="mr-2"
              >
                Go to Admin Dashboard
              </Button>
            )}
            {roles.includes('teacher') && (
              <Button 
                onClick={() => navigate('/teacher-dashboard')}
                variant="outline"
              >
                Go to Teacher Dashboard
              </Button>
            )}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Roles: {roles.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Wave Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Wave 1 - Bottom layer */}
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
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/auth")} 
            className="w-full"
          >
            Get Started
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Sign in or create an account to continue
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
