
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import LessonForm from "@/components/LessonForm";
import ProfileSection from "@/components/ProfileSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeacherDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your lessons and profile</p>
        </div>
        
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="lessons">Submit Lessons</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lessons" className="flex justify-center">
            <LessonForm teacherId={user.id} />
          </TabsContent>
          
          <TabsContent value="profile" className="max-w-4xl mx-auto">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
