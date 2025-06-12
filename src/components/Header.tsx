
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Menu } from "lucide-react";

interface Profile {
  name: string;
  role: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    }
  };

  const handleAdminDashboard = () => {
    navigate("/admin-dashboard");
  };

  const handleTeacherDashboard = () => {
    navigate("/teacher-dashboard");
  };

  if (!profile) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-700">WISE</h1>
            <span className="text-gray-600">Islamic Studies Progress Tracking</span>
          </div>
          <div className="flex items-center space-x-4">
            {(profile.role === "teacher" || profile.role === "admin") && (
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2">Menu</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    {profile.role === "teacher" && (
                      <MenubarItem onClick={handleAdminDashboard}>
                        Admin Dashboard
                      </MenubarItem>
                    )}
                    {profile.role === "admin" && (
                      <MenubarItem onClick={handleTeacherDashboard}>
                        Teacher Dashboard
                      </MenubarItem>
                    )}
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
            <span className="text-sm text-gray-600">
              Welcome, {profile.name} ({profile.role})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
