
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeacherSummary } from "./types";

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
            <TableHead>Total Lessons</TableHead>
            <TableHead>Completed Lessons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teacherSummary.map((summary, index) => (
            <TableRow key={index}>
              <TableCell>{summary.teacher}</TableCell>
              <TableCell>{summary.total}</TableCell>
              <TableCell>{summary.completed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherSummaryTable;
