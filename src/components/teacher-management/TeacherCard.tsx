
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, BookOpen, Users } from "lucide-react";

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    email: string;
    gender: string | null;
    age: number | null;
    subjects: string[];
    classes: string[];
  };
}

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{teacher.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Mail className="h-4 w-4 mr-1" />
              {teacher.email}
            </div>
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
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
