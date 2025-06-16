
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleSelector } from "./RoleSelector";
import { SubjectSelector } from "./SubjectSelector";
import { useAuth } from "@/contexts/AuthContext";

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
  const { setExplicitLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('AuthForm: Starting login for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('AuthForm: Login error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      console.log('AuthForm: Login successful for user:', data.user.id);
      
      // Set explicit login flag to allow navigation
      setExplicitLogin(true);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
    } catch (error: any) {
      console.error('AuthForm: Login failed:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
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

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      toast({
        title: "Valid Age Required",
        description: "Please enter a valid age between 1 and 150.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('AuthForm: Starting signup process for:', email);

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
            role: roles[0],
            subjects,
            gender: gender || null,
            age: parseInt(age)
          }
        }
      });

      if (error) {
        console.error('AuthForm: Signup error:', error);
        throw error;
      }

      console.log('AuthForm: Signup successful, user ID:', data.user?.id);

      // Insert additional roles if user selected multiple
      if (data.user && roles.length > 1) {
        const additionalRoles = roles.slice(1);
        console.log('Adding additional roles:', additionalRoles);
        
        for (const role of additionalRoles) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: role as 'teacher' | 'admin'
            });
          
          if (roleError) {
            console.error('Error adding additional role:', role, roleError);
          }
        }
      }
      
      toast({
        title: "Signup Successful",
        description: "Please check your email to confirm your account.",
      });
      onToggleMode();
      
    } catch (error: any) {
      console.error('AuthForm: Signup failed:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
      {!isLogin && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
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
                <SelectValue placeholder="Select your gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
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
        <Label htmlFor="email">Email *</Label>
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
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
      </Button>
    </form>
  );
};
