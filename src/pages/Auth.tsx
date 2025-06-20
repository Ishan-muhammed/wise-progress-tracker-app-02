
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [logoError, setLogoError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, loading, roles, isExplicitLogin, session } = useAuth();

  useEffect(() => {
    console.log('Auth page - User:', !!user, 'Session:', !!session, 'Loading:', loading, 'Roles:', roles, 'Explicit login:', isExplicitLogin);
    
    // Only navigate if user exists, session is valid, has roles, not loading, AND this is an explicit login
    if (!loading && user && session && roles.length > 0 && isExplicitLogin) {
      console.log('Auth: User detected with valid session and roles after explicit login, navigating...');
      if (roles.includes('admin')) {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard', { replace: true });
      } else if (roles.includes('teacher')) {
        console.log('Navigating to teacher dashboard');
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [user, session, loading, roles, navigate, isExplicitLogin]);

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

  // Get the public URL for the logo using the correct filename
  const { data: logoUrlData } = supabase.storage.from('logos').getPublicUrl('WISE Logo.png');
  const logoUrl = logoUrlData.publicUrl;

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
        
        {/* Wave 2 - Middle layer */}
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
        
        {/* Wave 3 - Top layer */}
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
            {!logoError ? (
              <img 
                src={logoUrl} 
                alt="WISE Logo" 
                className="h-12 w-auto object-contain mx-auto mb-2" 
                onLoad={() => console.log("Logo loaded successfully")}
                onError={(e) => {
                  console.error("Logo failed to load:", e);
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="h-12 w-24 bg-green-700 text-white flex items-center justify-center text-lg font-bold rounded mx-auto mb-2">
                WISE
              </div>
            )}
            <p className="text-lg text-muted-foreground">Islamic Studies Progress Tracking</p>
          </div>
          <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account" : "Join WISE to track Islamic studies progress"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm isLogin={isLogin} onToggleMode={() => setIsLogin(!isLogin)} />
          
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
