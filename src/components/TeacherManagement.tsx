
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useLessons } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentAcademicYear } from "@/utils/academicYearUtils";
import TeacherStatistics from "./teacher-management/TeacherStatistics";
import TeacherDirectory from "./teacher-management/TeacherDirectory";
import TeacherFilters from "./teacher-management/TeacherFilters";

const TeacherManagement = () => {
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  const { 
    profiles: teachers, 
    loading: teachersLoading, 
    error: teachersError, 
    refetch,
    archiveTeacher,
    restoreTeacher
  } = useTeacherProfiles({ statusFilter, academicYear });
  
  const { lessons, loading: lessonsLoading } = useLessons();
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

  // Filter lessons by academic year
  const filteredLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const lessonYear = lessonDate.getFullYear();
    const [startYear] = academicYear.split('/').map(y => parseInt(y));
    return lessonYear === startYear || lessonYear === startYear + 1;
  });
  
  // Only count active teachers for statistics
  const activeTeachers = teachers.filter(teacher => teacher.status === 'active');
  
  // Calculate statistics based on active teachers only
  const activeTeacherIds = activeTeachers.map(t => t.id);
  const activeTeacherLessons = filteredLessons.filter(lesson => activeTeacherIds.includes(lesson.user_id));
  
  const totalSubjects = [...new Set(activeTeacherLessons.map(lesson => lesson.subject))].length;
  const totalClasses = [...new Set(activeTeacherLessons.map(lesson => lesson.class))].length;

  // Calculate teacher statistics for completion rate (all teachers for display)
  const teacherStats = teachers.map(teacher => {
    const teacherLessons = filteredLessons.filter(lesson => lesson.user_id === teacher.id);
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
      classes,
      status: teacher.status,
      last_active_at: teacher.last_active_at
    };
  });

  // Calculate average completion rate only for active teachers
  const activeTeacherStats = teacherStats.filter(t => t.status === 'active');
  const avgCompletionRate = activeTeacherStats.length > 0 ? 
    Math.round(activeTeacherStats.reduce((acc, t) => acc + t.completionRate, 0) / activeTeacherStats.length) : 0;

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

      {/* Filters */}
      <TeacherFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        academicYear={academicYear}
        onAcademicYearChange={setAcademicYear}
      />

      {/* Statistics Cards */}
      <TeacherStatistics
        totalTeachers={activeTeachers.length}
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
      <TeacherDirectory 
        teachers={teacherStats} 
        onRefresh={handleRefresh}
        onArchive={archiveTeacher}
        onRestore={restoreTeacher}
      />
    </div>
  );
};

export default TeacherManagement;
