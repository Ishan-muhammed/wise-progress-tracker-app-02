
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading, roles } = useAuth();
  const [logoError, setLogoError] = useState<boolean>(false);

  useEffect(() => {
    // If user is authenticated and has roles, redirect to appropriate dashboard
    if (!loading && user && roles.length > 0) {
      console.log('Onboarding: Authenticated user detected, redirecting to dashboard');
      if (roles.includes('admin')) {
        navigate('/admin-dashboard', { replace: true });
      } else if (roles.includes('teacher')) {
        navigate('/teacher-dashboard', { replace: true });
      }
    }
  }, [user, loading, roles, navigate]);

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

  // Don't show onboarding if user is authenticated
  if (user && roles.length > 0) {
    return null;
  }

  // Get the public URL for the logo using the correct filename
  const { data: logoUrlData } = supabase.storage.from('logos').getPublicUrl('WISE Logo.png');
  const logoUrl = logoUrlData.publicUrl;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Wave Background - Same as Login */}
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
          <CardTitle>Welcome to WISE</CardTitle>
          <CardDescription>Track and manage Islamic studies progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/login")}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
