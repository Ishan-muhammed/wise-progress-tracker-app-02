
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading, error, roles, isExplicitLogin, session } = useAuth();

  useEffect(() => {
    console.log('Login page - User:', !!user, 'Session:', !!session, 'Loading:', loading, 'Roles:', roles, 'Explicit login:', isExplicitLogin);
    
    // Only navigate if user exists, session is valid, has roles, not loading, AND this is an explicit login
    if (!loading && user && session && roles.length > 0 && isExplicitLogin) {
      console.log('Login: User detected with valid session and roles after explicit login, navigating...');
      if (roles.includes('admin')) {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard', { replace: true });
      } else if (roles.includes('teacher')) {
        console.log('Navigating to teacher dashboard');  
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [user, session, loading, roles, navigate, error, isExplicitLogin]);

  // Show loading state
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
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            {error ? error : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm isLogin={true} onToggleMode={() => navigate("/auth")} />
          
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => navigate("/auth")}
            >
              Don't have an account? Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
