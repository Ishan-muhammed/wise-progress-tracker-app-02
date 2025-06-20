
import { forwardRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMonthsInAcademicYear } from "@/utils/academicYearUtils";

const academicMonths = getMonthsInAcademicYear();

interface MonthlyReportTableProps {
  summary: any;
  selectedClass: string | "all";
  selectedMonth: number;
  selectedAcademicYear: string;
}

const MonthlyReportTable = forwardRef<HTMLTableElement, MonthlyReportTableProps>(
  ({ summary, selectedClass, selectedMonth, selectedAcademicYear }, ref) => {
    const currentMonthLabel = academicMonths.find(m => m.value === selectedMonth)?.label || 'Unknown';

    if (Object.keys(summary).length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          {selectedClass === "all" 
            ? `No lessons recorded for ${currentMonthLabel} in academic year ${selectedAcademicYear}.`
            : `No lessons recorded for Class ${selectedClass} in ${currentMonthLabel} (${selectedAcademicYear}).`
          }
        </p>
      );
    }

    return (
      <Table ref={ref}>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Total Lessons (Syllabus)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.values(summary).map((item: any, index) => (
            <TableRow key={index}>
              <TableCell>Class {item.class}</TableCell>
              <TableCell>{item.subject}</TableCell>
              <TableCell>{item.completed}</TableCell>
              <TableCell>{item.totalLessonsInSyllabus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
);

MonthlyReportTable.displayName = "MonthlyReportTable";

export default MonthlyReportTable;
