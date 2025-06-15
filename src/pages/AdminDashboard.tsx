
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ReportButtons from "@/components/ReportButtons";
import ProfileSection from "@/components/ProfileSection";
import MigrationUtility from "@/components/MigrationUtility";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage reports, data, and system settings</p>
        </div>
        
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-6">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="migration">Data Migration</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports">
            <ReportButtons />
          </TabsContent>
          
          <TabsContent value="migration" className="flex justify-center">
            <MigrationUtility />
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
