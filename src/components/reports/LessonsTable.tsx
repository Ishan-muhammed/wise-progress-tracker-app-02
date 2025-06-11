
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LessonsTableProps {
  lessons: any[];
  getTeacherName: (teacherId: number) => string;
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
          <TableHead>Class</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Lesson #</TableHead>
          <TableHead>Teacher</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assessment Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((lesson: any) => (
          <TableRow key={lesson.id}>
            <TableCell>Class {lesson.class}</TableCell>
            <TableCell>{lesson.subject}</TableCell>
            <TableCell>{lesson.lessonNumber}</TableCell>
            <TableCell>{getTeacherName(lesson.teacherId)}</TableCell>
            <TableCell>
              <Badge variant={lesson.completed ? "default" : "secondary"}>
                {lesson.completed ? "Completed" : "Not Completed"}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {lesson.assessment || "No notes"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LessonsTable;
