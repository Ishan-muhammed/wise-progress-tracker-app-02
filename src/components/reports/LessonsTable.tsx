
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lesson } from "@/hooks/useLessons";

interface LessonsTableProps {
  lessons: Lesson[];
  emptyText?: string;
}

const LessonsTable = ({ lessons, emptyText }: LessonsTableProps) => {
  if (lessons.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {emptyText || "No lessons recorded for this date."}
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
            <TableCell>
              {lesson.profiles?.name || 'Unknown Teacher'}
            </TableCell>
            <TableCell>Class {lesson.class}</TableCell>
            <TableCell>{lesson.subject}</TableCell>
            <TableCell>{lesson.lesson_number}</TableCell>
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
