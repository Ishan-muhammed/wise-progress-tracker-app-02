
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Menu } from "lucide-react";

interface HeaderProps {
  user: {
    name: string;
    role: string;
  };
}

const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleAdminDashboard = () => {
    navigate("/admin-dashboard");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-700">WISE</h1>
            <span className="text-gray-600">Islamic Studies Progress Tracking</span>
          </div>
          <div className="flex items-center space-x-4">
            {user.role === "teacher" && (
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2">Menu</span>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={handleAdminDashboard}>
                      Admin Dashboard
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
            <span className="text-sm text-gray-600">
              Welcome, {user.name} ({user.role})
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
