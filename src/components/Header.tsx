
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
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, roles } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);

  // Always show Switch Dashboard if the user has more than 1 role
  const showMenu = roles.length > 1;

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .maybeSingle();
          if (error) {
            setError("Failed to load user profile.");
            setProfile(null);
          } else if (data) {
            setProfile(data);
          } else {
            setProfile(null);
            setError("No user profile found.");
          }
        } catch (err) {
          setError("Unexpected error loading user profile.");
          setProfile(null);
        }
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
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

  const handleAdminDashboard = () => navigate("/admin-dashboard");
  const handleTeacherDashboard = () => navigate("/teacher-dashboard");

  // Use profile.name if loaded, else use user's email as fallback, else "Loading..."
  let welcomeText = "Loading...";
  if (loading) {
    welcomeText = "Loading...";
  } else if (profile && profile.name) {
    welcomeText = profile.name;
  } else if (user?.email) {
    welcomeText = user.email;
  } else {
    welcomeText = "User";
  }

  console.log("Logo error state:", logoError);
  console.log("Attempting to load logo from:", "/lovable-uploads/672075cf-2f42-43eb-bf6d-cb2cdbf6134e.png");

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {!logoError ? (
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=200&fit=crop&crop=center"
                alt="WISE Logo" 
                className="h-12 w-auto object-contain"
                onLoad={() => console.log("Logo loaded successfully")}
                onError={(e) => {
                  console.error("Logo failed to load:", e);
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="h-12 w-24 bg-blue-600 text-white flex items-center justify-center text-sm font-semibold rounded">
                WISE
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {/* Show a skeleton while loading, error if failed, otherwise welcome */}
            <span className="text-sm text-gray-600">
              {loading ? (
                <Skeleton className="w-24 h-5" />
              ) : error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <>Welcome, {welcomeText} ({roles.join(", ")})</>
              )}
            </span>
            {showMenu && (
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2">Switch Dashboard</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    {roles.includes("teacher") && (
                      <MenubarItem onClick={handleTeacherDashboard}>
                        Teacher Dashboard
                      </MenubarItem>
                    )}
                    {roles.includes("admin") && (
                      <MenubarItem onClick={handleAdminDashboard}>
                        Admin Dashboard
                      </MenubarItem>
                    )}
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
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
