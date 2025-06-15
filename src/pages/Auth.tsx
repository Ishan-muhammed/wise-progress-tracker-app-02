
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
