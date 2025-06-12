
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeacherSummary {
  teacher: string;
  totalLessons: number;
  completedLessons: number;
}

interface TeacherSummaryTableProps {
  teacherSummary: TeacherSummary[];
}

const TeacherSummaryTable = ({ teacherSummary }: TeacherSummaryTableProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Summary by Teacher</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Classes Taught</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teacherSummary.map((summary, index) => (
            <TableRow key={index}>
              <TableCell>{summary.teacher}</TableCell>
              <TableCell>{summary.totalLessons}</TableCell>
              <TableCell>{summary.completedLessons}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherSummaryTable;
