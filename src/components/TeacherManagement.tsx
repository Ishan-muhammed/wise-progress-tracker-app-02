import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useLessons } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Download, UserPlus, Edit, MoreHorizontal, RefreshCw, Mail, BookOpen, Users, Calendar, LayoutGrid, List } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const TeacherManagement = () => {
  const { profiles: teachers, loading: teachersLoading, error: teachersError, refetch } = useTeacherProfiles();
  const { lessons, loading: lessonsLoading } = useLessons();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { toast } = useToast();

  // Calculate teacher activity status
  const getTeacherStatus = (teacherId: string) => {
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacherId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLessons = teacherLessons.filter(lesson => 
      new Date(lesson.date) >= thirtyDaysAgo
    );
    
    return recentLessons.length > 0 ? 'active' : 'inactive';
  };

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getTeacherStatus(teacher.id);
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Teacher data has been refreshed.",
    });
  };

  const handleExportData = () => {
    // Create CSV data
    const csvData = filteredTeachers.map(teacher => {
      const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
      const completedLessons = teacherLessons.filter(lesson => lesson.completed);
      const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];
      const classes = [...new Set(teacherLessons.map(lesson => lesson.class))].sort();
      
      return {
        Name: teacher.name,
        Email: teacher.email,
        Gender: teacher.gender || 'Not specified',
        Age: teacher.age || 'Not specified',
        Classes: classes.join('; '),
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

  // Calculate teacher statistics
  const teacherStats = filteredTeachers.map(teacher => {
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);
    const totalLessons = teacherLessons.length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];
    const classes = [...new Set(teacherLessons.map(lesson => lesson.class))].sort((a, b) => 
      parseInt(a) - parseInt(b)
    );
    const status = getTeacherStatus(teacher.id);

    // Get last active date
    const sortedLessons = teacherLessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastActiveDate = sortedLessons.length > 0 ? new Date(sortedLessons[0].date) : null;

    return {
      ...teacher,
      totalLessons,
      completedLessons: completedLessons.length,
      completionRate,
      subjects,
      classes,
      status,
      lastActiveDate
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600">Comprehensive overview of all teachers and their activities</p>
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
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Teacher
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-gray-500">Active in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teacherStats.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teacherStats.length > 0 ? Math.round(teacherStats.reduce((acc, t) => acc + t.completionRate, 0) / teacherStats.length) : 0}%
            </div>
            <p className="text-xs text-gray-500">Across all teachers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search teachers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {/* Teacher Cards/Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Directory ({filteredTeachers.length} teachers)</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No teachers found matching your criteria.</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherStats.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{teacher.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {teacher.email}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={teacher.status === 'active' ? 'default' : 'secondary'}
                          className={teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                        >
                          {teacher.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Demographics */}
                    {(teacher.gender || teacher.age) && (
                      <div className="text-sm text-gray-600">
                        {teacher.gender && <span>Gender: {teacher.gender}</span>}
                        {teacher.gender && teacher.age && <span> • </span>}
                        {teacher.age && <span>Age: {teacher.age}</span>}
                      </div>
                    )}

                    {/* Subjects */}
                    <div>
                      <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Subjects ({teacher.subjects.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.length > 0 ? (
                          teacher.subjects.slice(0, 3).map(subject => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No subjects assigned</span>
                        )}
                        {teacher.subjects.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{teacher.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Assigned Classes */}
                    <div>
                      <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        Classes ({teacher.classes.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.length > 0 ? (
                          teacher.classes.slice(0, 4).map(cls => (
                            <Badge key={cls} variant="outline" className="text-xs">
                              Class {cls}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No classes assigned</span>
                        )}
                        {teacher.classes.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{teacher.classes.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Performance</span>
                        <span className="text-sm font-semibold">{teacher.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            teacher.completionRate >= 80 ? 'bg-green-600' :
                            teacher.completionRate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${teacher.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{teacher.completedLessons}/{teacher.totalLessons} lessons</span>
                        {teacher.lastActiveDate && (
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {teacher.lastActiveDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
