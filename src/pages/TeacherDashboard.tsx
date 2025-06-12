
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import LessonForm from "@/components/LessonForm";

const TeacherDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex justify-center items-start py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Submit lesson data and track your progress</p>
          </div>
          <LessonForm teacherId={user.id} />
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
