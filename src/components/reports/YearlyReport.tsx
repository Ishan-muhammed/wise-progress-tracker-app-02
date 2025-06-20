
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import { generateAcademicYears, getCurrentAcademicYear, getAcademicYearDateRange } from "@/utils/academicYearUtils";

const subjects = [
  { name: "Aqeedah", totalLessons: 20 },
  { name: "Quran", totalLessons: 20 },
  { name: "Hadith", totalLessons: 20 },
  { name: "Tajweed", totalLessons: 20 },
  { name: "Fiqh", totalLessons: 20 },
  { name: "Arabic", totalLessons: 20 }
];

const classes = ["8", "9", "10", "11", "12"];
const academicYears = generateAcademicYears(2025, 5);

const YearlyReport = () => {
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(getCurrentAcademicYear());
  
  // Get date range for selected academic year
  const { startDate, endDate } = getAcademicYearDateRange(selectedAcademicYear);
  
  const { lessons, loading, error } = useLessonsInDateRange(startDate, endDate);
  
  console.log("Yearly Report - Academic year:", selectedAcademicYear);
  console.log("Yearly Report - Date range:", startDate, "to", endDate);
  console.log("Yearly Report - All lessons:", lessons.length);

  // Filter lessons by selected class
  const filteredLessons = selectedClass === "all" 
    ? lessons.filter(lesson => lesson.completed)
    : lessons.filter(lesson => lesson.class === selectedClass && lesson.completed);

  console.log("Yearly Report - Filtered completed lessons:", filteredLessons.length);

  // Calculate summary for each class and subject
  const summary: any = [];
  
  const classesToProcess = selectedClass === "all" ? classes : [selectedClass];
  
  classesToProcess.forEach(cls => {
    subjects.forEach(subject => {
      const classSubjectLessons = filteredLessons.filter((lesson: any) => 
        lesson.class === cls && lesson.subject === subject.name
      );
      
      const completed = classSubjectLessons.length;
      const total = subject.totalLessons;
      const pending = total - completed;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      summary.push({
        class: cls,
        subject: subject.name,
        completed,
        pending,
        total,
        percentage
      });
    });
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Summary - {selectedAcademicYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading lessons...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Summary - {selectedAcademicYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Academic Year Summary - {selectedAcademicYear}</CardTitle>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Academic Year:</span>
            <Select
              value={selectedAcademicYear}
              onValueChange={setSelectedAcademicYear}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {selectedAcademicYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.label} value={year.label}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Filter by Class:</span>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(classVal => (
                  <SelectItem key={classVal} value={classVal}>
                    Class {classVal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {summary.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedClass === "all" 
              ? `No lessons recorded for academic year ${selectedAcademicYear}.`
              : `No lessons recorded for Class ${selectedClass} in academic year ${selectedAcademicYear}.`
            }
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>Class {item.class}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>{item.completed}/{item.total}</TableCell>
                  <TableCell>{item.pending}</TableCell>
                  <TableCell className="w-32">
                    <Progress value={item.percentage} className="w-full" />
                  </TableCell>
                  <TableCell>{item.percentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default YearlyReport;
