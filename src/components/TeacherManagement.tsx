
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useLessons } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TeacherStatistics from "./teacher-management/TeacherStatistics";
import TeacherDirectory from "./teacher-management/TeacherDirectory";

const TeacherManagement = () => {
  const { profiles: teachers, loading: teachersLoading, error: teachersError, refetch } = useTeacherProfiles();
  const { lessons, loading: lessonsLoading } = useLessons();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { toast } = useToast();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Teacher data has been refreshed.",
    });
  };


  if (teachersLoading || lessonsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (teachersError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
            <p className="text-red-600">Error loading teachers: {teachersError}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSubjects = [...new Set(lessons.map(lesson => lesson.subject))].length;
  const totalClasses = [...new Set(lessons.map(lesson => lesson.class))].length;

  // Calculate teacher statistics for completion rate
  const teacherStats = teachers.map(teacher => {
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);
    const totalLessons = teacherLessons.length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];
    const classes = [...new Set(teacherLessons.map(lesson => lesson.class))].sort((a, b) => 
      parseInt(a) - parseInt(b)
    );

    return {
      ...teacher,
      totalLessons,
      completedLessons: completedLessons.length,
      completionRate,
      subjects,
      classes
    };
  });

  const avgCompletionRate = teacherStats.length > 0 ? 
    Math.round(teacherStats.reduce((acc, t) => acc + t.completionRate, 0) / teacherStats.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600">Comprehensive overview of all teachers and their activities</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <TeacherStatistics
        totalTeachers={teachers.length}
        totalSubjects={totalSubjects}
        totalClasses={totalClasses}
        avgCompletionRate={avgCompletionRate}
      />

      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Teacher Directory */}
      <TeacherDirectory teachers={teacherStats} onRefresh={handleRefresh} />
    </div>
  );
};

export default TeacherManagement;
