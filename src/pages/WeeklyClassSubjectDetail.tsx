
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Users, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLessons } from "@/hooks/useLessons";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useSyllabusForReports } from "@/hooks/useSyllabusForReports";
import { generateTablePDF } from "@/utils/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek } from "date-fns";
import Header from "@/components/Header";
import { useRef } from "react";

const WeeklyClassSubjectDetail = () => {
  const { date, className, subject } = useParams<{
    date: string;
    className: string;
    subject: string;
  }>();
  const navigate = useNavigate();
  const { lessons, loading } = useLessons();
  const { profiles } = useTeacherProfiles();
  const { syllabusData } = useSyllabusForReports();
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  if (!date || !className || !subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Parameters</h2>
            <p className="text-gray-600 mb-6">Missing required parameters for the report.</p>
            <Button onClick={() => navigate('/admin-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const selectedDate = new Date(date);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Filter lessons for this specific week, class, and subject
  const weeklyLessons = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate >= weekStart && 
           lessonDate <= weekEnd && 
           lesson.class === className && 
           lesson.subject === subject;
  });

  // Get syllabus info for this class/subject
  const syllabusInfo = syllabusData.find(
    s => s.class === className && s.subject === subject
  );

  // Calculate completion statistics
  const completedLessons = weeklyLessons.filter(lesson => lesson.completed);
  const completionRate = weeklyLessons.length > 0 
    ? Math.round((completedLessons.length / weeklyLessons.length) * 100) 
    : 0;

  // Get unique teachers for this class/subject combination
  const teacherIds = [...new Set(weeklyLessons.map(lesson => lesson.user_id))];
  const teachers = profiles.filter(profile => teacherIds.includes(profile.id));

  const handleDownloadPDF = async () => {
    if (!tableRef.current) {
      toast({
        title: "Error",
        description: "Unable to generate PDF - content not found",
        variant: "destructive"
      });
      return;
    }

    try {
      const filename = `weekly-detail-${className}-${subject}-${format(weekStart, 'yyyy-MM-dd')}.pdf`;
      const title = `Weekly Lesson Details - Class ${className} - ${subject}`;
      
      await generateTablePDF(tableRef.current, filename, title);
      
      toast({
        title: "PDF Downloaded",
        description: "Weekly lesson details have been exported successfully"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-lg">Loading lesson details...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation and Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="hover:text-gray-900 transition-colors"
            >
              Admin Dashboard
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="hover:text-gray-900 transition-colors"
            >
              Reports
            </button>
            <span>›</span>
            <span className="text-gray-900 font-medium">Weekly Details</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Class {className} - {subject}
                </h1>
                <p className="text-gray-600">
                  Week of {format(weekStart, 'MMMM d')} - {format(weekEnd, 'd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin-dashboard')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{weeklyLessons.length}</div>
              <p className="text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedLessons.length}</div>
              <p className="text-gray-600">Lessons completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{teachers.length}</div>
              <p className="text-gray-600">Teaching this class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-orange-600" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Lessons Table */}
        <div ref={tableRef}>
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyLessons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No lessons found for this week, class, and subject combination.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lesson #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assessment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {weeklyLessons.map((lesson) => {
                        const teacher = profiles.find(p => p.id === lesson.user_id);
                        return (
                          <tr key={lesson.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(new Date(lesson.date), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {lesson.lesson_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {teacher?.name || 'Unknown Teacher'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={lesson.completed ? "default" : "secondary"}>
                                {lesson.completed ? "Completed" : "Pending"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {lesson.assessment || "No assessment provided"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Syllabus Information */}
        {syllabusInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Syllabus Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons in Syllabus</p>
                  <p className="text-2xl font-bold text-gray-900">{syllabusInfo.total_lessons}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lessons This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{weeklyLessons.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weekly Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((weeklyLessons.length / syllabusInfo.total_lessons) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default WeeklyClassSubjectDetail;
