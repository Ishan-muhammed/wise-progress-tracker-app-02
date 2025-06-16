
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ReportButtons from "@/components/ReportButtons";
import ProfileSection from "@/components/ProfileSection";
import TeacherManagement from "@/components/TeacherManagement";
import LogoutButton from "@/components/LogoutButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { user, isAdmin, roles, loading } = useAuth();

  // Show loading only while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }

  // If no user after loading is complete, redirect will be handled by ProtectedRoute
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Authentication required...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage reports, teachers, and system settings</p>
            </div>
            <LogoutButton />
          </div>
        </div>
        
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6">
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-[#039559] data-[state=active]:text-white"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="teachers"
              className="data-[state=active]:bg-[#039559] data-[state=active]:text-white"
            >
              Teachers
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-[#039559] data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
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
