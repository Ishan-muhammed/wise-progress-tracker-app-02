import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import { useSyllabusForReports } from "@/hooks/useSyllabusForReports";
import { generateAcademicYears, getCurrentAcademicYear, getMonthsInAcademicYear, getMonthDateRange } from "@/utils/academicYearUtils";

// List of classes 8-12 only
const ALL_CLASSES = ['8', '9', '10', '11', '12'];

// Generate academic years starting from 2025/26
const academicYears = generateAcademicYears(2025, 5);
const academicMonths = getMonthsInAcademicYear();
const MonthlyReport = () => {
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(getCurrentAcademicYear());

  // Calculate date range for selected month in academic year
  const {
    startDate,
    endDate
  } = getMonthDateRange(selectedMonth, selectedAcademicYear);
  const {
    lessons,
    loading,
    error
  } = useLessonsInDateRange(startDate, endDate);
  const {
    getTotalLessons,
    loading: syllabusLoading
  } = useSyllabusForReports();
  console.log("Monthly Report - Academic year:", selectedAcademicYear);
  console.log("Monthly Report - Month:", selectedMonth);
  console.log("Monthly Report - Date range:", startDate, "to", endDate);
  console.log("Monthly Report - Lessons from Supabase:", lessons.length);

  // Filter lessons by selected class
  const filteredLessons = useMemo(() => {
    if (selectedClass === "all") return lessons;
    return lessons.filter(lesson => lesson.class === selectedClass);
  }, [lessons, selectedClass]);

  // Summary by class and subject
  const summary: any = {};
  filteredLessons.forEach(lesson => {
    const key = `${lesson.class}-${lesson.subject}`;
    if (!summary[key]) {
      summary[key] = {
        class: lesson.class,
        subject: lesson.subject,
        completed: 0,
        total: 0,
        totalLessonsInSyllabus: getTotalLessons(lesson.subject, lesson.class)
      };
    }
    summary[key].total++;
    if (lesson.completed) summary[key].completed++;
  });

  // Get current month label
  const currentMonthLabel = academicMonths.find(m => m.value === selectedMonth)?.label || 'Unknown';
  const isLoading = loading || syllabusLoading;
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle>Monthly Report - {currentMonthLabel} ({selectedAcademicYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading lessons...</div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card>
        <CardHeader>
          <CardTitle>Monthly Report - {currentMonthLabel} ({selectedAcademicYear})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Monthly Report - {currentMonthLabel} ({selectedAcademicYear})</CardTitle>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm py-[15px]">Academic Year:</span>
            <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {selectedAcademicYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => <SelectItem key={year.label} value={year.label}>
                    {year.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Select Month:</span>
            <Select value={selectedMonth.toString()} onValueChange={value => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {currentMonthLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicMonths.map(month => <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Filter by Class:</span>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {ALL_CLASSES.map(classVal => <SelectItem key={classVal} value={classVal}>
                    Class {classVal}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(summary).length === 0 ? <p className="text-center text-muted-foreground py-8">
            {selectedClass === "all" ? `No lessons recorded for ${currentMonthLabel} in academic year ${selectedAcademicYear}.` : `No lessons recorded for Class ${selectedClass} in ${currentMonthLabel} (${selectedAcademicYear}).`}
          </p> : <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Monthly Lessons</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Total Lessons (Syllabus)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(summary).map((item: any, index) => <TableRow key={index}>
                  <TableCell>Class {item.class}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell>{item.completed}</TableCell>
                  <TableCell>{item.totalLessonsInSyllabus}</TableCell>
                </TableRow>)}
            </TableBody>
          </Table>}
      </CardContent>
    </Card>;
};
export default MonthlyReport;