
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import TeacherCard from "./TeacherCard";

interface TeacherDirectoryProps {
  teachers: Array<{
    id: string;
    name: string;
    email: string;
    gender: string | null;
    age: number | null;
    subjects: string[];
    classes: string[];
    status: 'active' | 'inactive' | 'archived';
    last_active_at?: string | null;
  }>;
  onRefresh: () => void;
  onArchive?: (teacherId: string, reason?: string) => Promise<boolean>;
  onRestore?: (teacherId: string) => Promise<boolean>;
}

const TeacherDirectory = ({ teachers, onRefresh, onArchive, onRestore }: TeacherDirectoryProps) => {
  const handleTeacherDeleted = () => {
    // Refresh the teacher list when a teacher is deleted
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Directory ({teachers.length} teachers)</CardTitle>
      </CardHeader>
      <CardContent>
        {teachers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No teachers found.</p>
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <TeacherCard 
                key={teacher.id} 
                teacher={teacher} 
                onTeacherDeleted={handleTeacherDeleted}
                onArchive={onArchive}
                onRestore={onRestore}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherDirectory;
