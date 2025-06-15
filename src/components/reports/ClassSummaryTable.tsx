
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClassSummary {
  class: string;
  subject: string;
  completed: number;
  total: number;
  teacher: string;
  lessons: string[];
}

interface ClassSummaryTableProps {
  classSummary: Record<string, ClassSummary>;
  weekStart?: string;
  weekEnd?: string;
}

const ClassSummaryTable = ({ classSummary, weekStart, weekEnd }: ClassSummaryTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (summary: ClassSummary) => {
    if (weekStart && weekEnd) {
      const encodedTeacher = encodeURIComponent(summary.teacher);
      navigate(`/weekly-detail/${summary.class}/${summary.subject}/${encodedTeacher}/${weekStart}/${weekEnd}`);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Summary by Class & Subject</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Lessons</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Total Lessons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(classSummary).map((summary: ClassSummary, index) => (
            <TableRow 
              key={index}
              onClick={() => handleRowClick(summary)}
              className={weekStart && weekEnd ? "cursor-pointer hover:bg-blue-50 transition-colors" : ""}
            >
              <TableCell>Class {summary.class}</TableCell>
              <TableCell>{summary.subject}</TableCell>
              <TableCell>{summary.lessons.join(', ')}</TableCell>
              <TableCell>{summary.teacher}</TableCell>
              <TableCell>{summary.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {weekStart && weekEnd && (
        <p className="text-sm text-muted-foreground mt-2">
          Click on any row to view detailed lessons for that class and subject.
        </p>
      )}
    </div>
  );
};

export default ClassSummaryTable;
