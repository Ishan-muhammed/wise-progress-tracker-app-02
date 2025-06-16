
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import LessonForm from "@/components/LessonForm";
import ProfileSection from "@/components/ProfileSection";
import LogoutButton from "@/components/LogoutButton";
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Wave Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* Wave 1 - Bottom layer */}
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-60"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,400 C300,200 600,600 900,300 C1050,150 1200,500 1200,400 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-40"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,500 C200,300 500,700 800,400 C950,250 1200,600 1200,500 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
        
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-20"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,600 C400,400 700,800 1000,500 C1100,400 1200,700 1200,600 L1200,800 L0,800 Z"
            fill="#039559"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600">Manage your lessons an profile</p>
              </div>
              <LogoutButton />
            </div>
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
    </div>
  );
};

export default TeacherDashboard;
