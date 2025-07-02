import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, BookOpen, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTeacherData } from "@/hooks/useTeacherData";
import Header from "@/components/Header";
import TeacherWeeklyChart from "@/components/teacher-profile/TeacherWeeklyChart";
import TeacherMonthlyChart from "@/components/teacher-profile/TeacherMonthlyChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const TeacherProfile = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [weeklyStartDate, setWeeklyStartDate] = useState<Date>(new Date());
  const [monthlyStartDate, setMonthlyStartDate] = useState<Date>(new Date());
  
  const { teacher, totalLessons, completedLessons, completionRate, weeklyData, monthlyData, loading } = useTeacherData(
    teacherId || '', 
    { 
      weeklyStartDate, 
      monthlyStartDate,
      useSampleData: true,
      includeArchived: true
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Teacher Not Found</h2>
            <p className="text-gray-600 mb-6">The requested teacher profile could not be found.</p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="hover:text-gray-900 transition-colors"
            >
              Admin Dashboard
            </button>
            <span>›</span>
            <span>Teachers</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">{teacher.name}</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                <p className="text-gray-600">{teacher.email}</p>
              </div>
            </div>
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

        {/* Top Section - Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Teacher Details Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Teacher Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{teacher.gender || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{teacher.age || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-sm">{teacher.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Lessons Panel */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{totalLessons}</div>
                <p className="text-gray-600">Lessons assigned</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Lessons Panel */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200" 
            onClick={() => navigate(`/teacher-completed-lessons/${teacherId}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Completed Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{completedLessons}</div>
                <p className="text-gray-600">of {totalLessons} lessons</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mt-2">Click to view details</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Chart Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Weekly Class Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherWeeklyChart 
                data={weeklyData} 
                onDateRangeChange={setWeeklyStartDate}
              />
            </CardContent>
          </Card>

          {/* Monthly Chart Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Monthly Class Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherMonthlyChart 
                data={monthlyData} 
                onDateRangeChange={setMonthlyStartDate}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherProfile;
