
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useLessons } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw, LayoutGrid, List } from "lucide-react";
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

  const handleExportData = () => {
    // Create CSV data
    const csvData = teachers.map(teacher => {
      const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
      const completedLessons = teacherLessons.filter(lesson => lesson.completed);
      const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];
      
      return {
        Name: teacher.name,
        Email: teacher.email,
        Gender: teacher.gender || 'Not specified',
        Age: teacher.age || 'Not specified',
        Classes: teacher.classes.join('; '),
        Subjects: subjects.join('; '),
        'Total Lessons': teacherLessons.length,
        'Completed Lessons': completedLessons.length,
        'Completion Rate': teacherLessons.length > 0 ? Math.round((completedLessons.length / teacherLessons.length) * 100) + '%' : '0%'
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Teacher data has been exported to CSV.",
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

  // Calculate statistics using assigned classes instead of derived from lessons
  const totalSubjects = [...new Set(lessons.map(lesson => lesson.subject))].length;
  const totalClasses = [...new Set(teachers.flatMap(teacher => teacher.classes))].length;

  // Calculate teacher statistics for completion rate
  const teacherStats = teachers.map(teacher => {
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);
    const totalLessons = teacherLessons.length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];

    return {
      ...teacher,
      totalLessons,
      completedLessons: completedLessons.length,
      completionRate,
      subjects
    };
  });

  const avgCompletionRate = teacherStats.length > 0 ? 
    Math.round(teacherStats.reduce((acc, t) => acc + t.completionRate, 0) / teacherStats.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600 text-center">Comprehensive overview of all teachers and their activities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
