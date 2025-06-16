
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth', { replace: true });
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline" 
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
