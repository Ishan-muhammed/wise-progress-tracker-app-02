
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Lesson {
  id: number;
  teacherId: string;
  class: string;
  subject: string;
  lessonNumber: string;
  date: string;
  completed: boolean;
  assessment: string;
}

interface LessonsTableProps {
  lessons: Lesson[];
  getTeacherName: (teacherId: string) => string;
}

const LessonsTable = ({ lessons, getTeacherName }: LessonsTableProps) => {
  if (lessons.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No lessons recorded for this date.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Teacher</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Lesson</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assessment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((lesson) => (
          <TableRow key={lesson.id}>
            <TableCell>{getTeacherName(lesson.teacherId)}</TableCell>
            <TableCell>Class {lesson.class}</TableCell>
            <TableCell>{lesson.subject}</TableCell>
            <TableCell>{lesson.lessonNumber}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs ${
                lesson.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {lesson.completed ? 'Completed' : 'In Progress'}
              </span>
            </TableCell>
            <TableCell className="max-w-xs truncate">{lesson.assessment || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LessonsTable;
