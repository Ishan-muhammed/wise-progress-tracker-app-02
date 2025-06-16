
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

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
            <h1 className="text-4xl font-bold text-green-700 mb-2">WISE</h1>
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
