
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect to appropriate dashboard
      navigate("/teacher-dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
