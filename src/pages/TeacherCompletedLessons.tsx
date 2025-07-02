import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeacherLessons } from "@/hooks/useTeacherLessons";
import Header from "@/components/Header";
import CompletedLessonsTable from "@/components/completed-lessons/CompletedLessonsTable";
import CompletedLessonsFilters from "@/components/completed-lessons/CompletedLessonsFilters";
import { useState, useMemo } from "react";

const TeacherCompletedLessons = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { teacher, completedLessons, completedCount, completionRate, loading } = useTeacherLessons(
    teacherId || '', 
    { includeArchived: true }
  );

  // Filter completed lessons
  const filteredLessons = useMemo(() => {
    let filtered = completedLessons;

    if (classFilter !== "all") {
      filtered = filtered.filter(lesson => lesson.class === classFilter);
    }

    if (subjectFilter !== "all") {
      filtered = filtered.filter(lesson => lesson.subject === subjectFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(lesson => 
        lesson.lesson_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.assessment && lesson.assessment.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedLessons, classFilter, subjectFilter, searchTerm]);

  // Get unique classes and subjects for filters
  const availableClasses = useMemo(() => {
    const classes = [...new Set(completedLessons.map(lesson => lesson.class))];
    return classes.sort();
  }, [completedLessons]);

  const availableSubjects = useMemo(() => {
    const subjects = [...new Set(completedLessons.map(lesson => lesson.subject))];
    return subjects.sort();
  }, [completedLessons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="h-8 bg-muted/50 rounded animate-pulse" />
            <div className="h-32 bg-muted/50 rounded animate-pulse" />
            <div className="h-64 bg-muted/50 rounded animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Teacher Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested teacher could not be found.</p>
            <Button onClick={() => navigate('/admin-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="hover:text-foreground transition-colors"
            >
              Admin Dashboard
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate(`/teacher-profile/${teacherId}`)}
              className="hover:text-foreground transition-colors"
            >
              {teacher.name}
            </button>
            <span>›</span>
            <span className="text-foreground font-medium">Completed Lessons</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Completed Lessons</h1>
                <p className="text-muted-foreground">
                  {teacher.name} • {teacher.status === 'archived' && (
                    <Badge variant="secondary" className="ml-2">Archived</Badge>
                  )}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/teacher-profile/${teacherId}`)}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Total Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{completedCount}</div>
                <p className="text-muted-foreground">lessons completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{completionRate}%</div>
                <p className="text-muted-foreground">overall completion</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                Filtered Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{filteredLessons.length}</div>
                <p className="text-muted-foreground">lessons shown</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CompletedLessonsFilters
            classFilter={classFilter}
            onClassFilterChange={setClassFilter}
            subjectFilter={subjectFilter}
            onSubjectFilterChange={setSubjectFilter}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            availableClasses={availableClasses}
            availableSubjects={availableSubjects}
          />
        </div>

        {/* Lessons Table */}
        <CompletedLessonsTable lessons={filteredLessons} loading={loading} />
      </main>
    </div>
  );
};

export default TeacherCompletedLessons;