
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  name: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, roles, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Always show menu (contains logout and dashboard switching)
  const showMenu = true;

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
    if (isLoggingOut) return; // Prevent multiple simultaneous logout attempts
    
    setIsLoggingOut(true);
    console.log('Header: Starting logout process...');
    
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error('Header: Logout failed:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
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

  // Get the public URL for the logo using the correct filename
  const { data: logoUrlData } = supabase.storage.from('logos').getPublicUrl('WISE Logo.png');
  const logoUrl = logoUrlData.publicUrl;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {!logoError ? (
              <img 
                src={logoUrl} 
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {showMenu && (
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer flex items-center">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Menu</span>
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
                    {roles.length > 0 && <MenubarSeparator />}
                    <MenubarItem onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
