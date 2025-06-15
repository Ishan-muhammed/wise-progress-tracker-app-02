
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ReportButtons from "@/components/ReportButtons";
import ProfileSection from "@/components/ProfileSection";
import TeacherManagement from "@/components/TeacherManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user, isAdmin, roles } = useAuth();

  console.log('=== ADMIN DASHBOARD DEBUG ===');
  console.log('Current user:', user?.id);
  console.log('User email:', user?.email);
  console.log('Is admin:', isAdmin);
  console.log('All roles:', roles);
  console.log('=== END ADMIN DASHBOARD DEBUG ===');

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage reports, teachers, and system settings</p>
          
          {/* Debug info for admin authentication */}
          <div className="mt-4 flex justify-center gap-2">
            <Badge variant={isAdmin ? "default" : "destructive"}>
              {isAdmin ? "Admin Access" : "Not Admin"}
            </Badge>
            <Badge variant="outline">
              User: {user.email}
            </Badge>
            <Badge variant="secondary">
              Roles: {roles.join(', ')}
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports">
            <ReportButtons />
          </TabsContent>
          
          <TabsContent value="teachers">
            <TeacherManagement />
          </TabsContent>
          
          <TabsContent value="profile" className="max-w-4xl mx-auto">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
