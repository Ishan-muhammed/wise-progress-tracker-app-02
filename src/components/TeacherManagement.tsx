
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTeacherProfiles } from "@/hooks/useTeacherProfiles";
import { useLessons } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";

const TeacherManagement = () => {
  const { profiles: teachers, loading: teachersLoading } = useTeacherProfiles();
  const { lessons, loading: lessonsLoading } = useLessons();

  if (teachersLoading || lessonsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Calculate teacher statistics
  const teacherStats = teachers.map(teacher => {
    const teacherLessons = lessons.filter(lesson => lesson.user_id === teacher.id);
    const completedLessons = teacherLessons.filter(lesson => lesson.completed);
    const totalLessons = teacherLessons.length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    
    // Get unique subjects taught by this teacher
    const subjects = [...new Set(teacherLessons.map(lesson => lesson.subject))];
    
    // Get unique classes taught by this teacher
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
          <p className="text-gray-600">Comprehensive overview of all teachers and their activities</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Teachers: {teachers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lessons.filter(lesson => lesson.completed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherStats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No teachers found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherStats.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {teacher.gender && (
                          <div>Gender: {teacher.gender}</div>
                        )}
                        {teacher.age && (
                          <div>Age: {teacher.age}</div>
                        )}
                        {!teacher.gender && !teacher.age && (
                          <span className="text-gray-400">No data</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.length > 0 ? (
                          teacher.classes.map(cls => (
                            <Badge key={cls} variant="outline" className="text-xs">
                              Class {cls}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No classes</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.length > 0 ? (
                          teacher.subjects.map(subject => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No subjects</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{teacher.completedLessons}/{teacher.totalLessons}</div>
                        <div className="text-gray-500">lessons</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium">
                          {teacher.completionRate}%
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${teacher.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
