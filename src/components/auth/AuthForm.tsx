
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoleSelector } from "./RoleSelector";
import { SubjectSelector } from "./SubjectSelector";

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
}

export const AuthForm = ({ isLogin, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roles, setRoles] = useState<string[]>(["teacher"]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Get user roles to determine redirect
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      
      const hasAdmin = userRoles?.some(r => r.role === 'admin');
      const hasTeacher = userRoles?.some(r => r.role === 'teacher');
      
      // Redirect based on roles (admin takes precedence)
      if (hasAdmin) {
        navigate('/admin-dashboard');
      } else if (hasTeacher) {
        navigate('/teacher-dashboard');
      } else {
        navigate('/teacher-dashboard'); // Default fallback
      }
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (roles.length === 0) {
      toast({
        title: "Role Required",
        description: "Please select at least one role.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && subjects.length === 0) {
      toast({
        title: "Subjects Required",
        description: "Please select at least one subject you teach.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role: roles[0],
          subjects,
          gender,
          age: age ? parseInt(age) : null
        }
      }
    });

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Insert additional roles if user selected multiple
      if (data.user && roles.length > 1) {
        const additionalRoles = roles.slice(1);
        for (const role of additionalRoles) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: role as 'teacher' | 'admin'
            });
        }
      }
      
      toast({
        title: "Signup Successful",
        description: "Please check your email to confirm your account.",
      });
      onToggleMode();
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
      {!isLogin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              min="1"
              max="150"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <RoleSelector roles={roles} setRoles={setRoles} />
          <SubjectSelector subjects={subjects} setSubjects={setSubjects} />
        </>
      )}
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
        {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
      </Button>
    </form>
  );
};
