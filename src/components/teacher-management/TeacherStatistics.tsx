
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeacherStatisticsProps {
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  avgCompletionRate: number;
}

const TeacherStatistics = ({ 
  totalTeachers, 
  totalSubjects, 
  totalClasses, 
  avgCompletionRate 
}: TeacherStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTeachers}</div>
          <p className="text-xs text-gray-500">Registered in system</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalSubjects}</div>
          <p className="text-xs text-gray-500">Being taught</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalClasses}</div>
          <p className="text-xs text-gray-500">In the system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Avg. Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionRate}%</div>
          <p className="text-xs text-gray-500">Across all teachers</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStatistics;
