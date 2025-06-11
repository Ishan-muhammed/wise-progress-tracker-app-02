
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { initializeSampleData } from "@/utils/sampleData";

// Mock users for demonstration
const mockUsers = [
  { id: 1, email: "teacher1@wise.edu", password: "teacher123", role: "teacher", name: "Ahmad Hassan" },
  { id: 2, email: "teacher2@wise.edu", password: "teacher123", role: "teacher", name: "Fatima Ali" },
  { id: 3, email: "admin@wise.edu", password: "admin123", role: "admin", name: "Dr. Omar Rahman" }
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      if (user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/admin-dashboard");
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-green-700 mb-2">WISE</h1>
            <p className="text-lg text-muted-foreground">Islamic Studies Progress Tracking</p>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Teacher: teacher1@wise.edu / teacher123</p>
            <p>Admin: admin@wise.edu / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
