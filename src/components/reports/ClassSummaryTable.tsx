
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClassSummary {
  class: string;
  subject: string;
  completed: number;
  total: number;
  teacher: string;
}

interface ClassSummaryTableProps {
  classSummary: Record<string, ClassSummary>;
}

const ClassSummaryTable = ({ classSummary }: ClassSummaryTableProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Summary by Class & Subject</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Total Lessons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(classSummary).map((summary: ClassSummary, index) => (
            <TableRow key={index}>
              <TableCell>Class {summary.class}</TableCell>
              <TableCell>{summary.subject}</TableCell>
              <TableCell>{summary.teacher}</TableCell>
              <TableCell>{summary.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassSummaryTable;
