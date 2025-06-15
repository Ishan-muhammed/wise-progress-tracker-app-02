
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";

// List of classes 8-12 only
const ALL_CLASSES = ['8','9','10','11','12'];

// Generate months and years for selection
const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];

// Generate years (current year and previous 2 years)
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

const MonthlyReport = () => {
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Calculate date range for selected month/year
  const monthStart = new Date(selectedYear, selectedMonth, 1);
  const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
  
  const monthStartStr = monthStart.toISOString().split('T')[0];
  const monthEndStr = monthEnd.toISOString().split('T')[0];

  const { lessons, loading, error } = useLessonsInDateRange(monthStartStr, monthEndStr);

  console.log("Monthly Report - Date range:", monthStartStr, "to", monthEndStr);
  console.log("Monthly Report - Lessons from Supabase:", lessons.length);

  // Filter lessons by selected class
  const filteredLessons = useMemo(() => {
    if (selectedClass === "all") return lessons;
    return lessons.filter((lesson) => lesson.class === selectedClass);
  }, [lessons, selectedClass]);

  // Summary by class and subject
  const summary: any = {};
  filteredLessons.forEach((lesson) => {
    const key = `${lesson.class}-${lesson.subject}`;
    if (!summary[key]) {
      summary[key] = {
        class: lesson.class,
        subject: lesson.subject,
        completed: 0,
        total: 0
      };
    }
    summary[key].total++;
    if (lesson.completed) summary[key].completed++;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report - {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
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
          <CardTitle>Monthly Report - {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
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
          <CardTitle>Monthly Report - {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Select Month:</span>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {MONTHS.find(m => m.value === selectedMonth)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <span className="text-muted-foreground text-sm">Select Year:</span>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue>
                  {selectedYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
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
                {ALL_CLASSES.map(classVal => (
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
        {Object.keys(summary).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedClass === "all" 
              ? `No lessons recorded for ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`
              : `No lessons recorded for Class ${selectedClass} in ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`
            }
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Total Lessons</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(summary).map((item: any, index) => (
                <TableRow key={index}>
                  <TableCell>Class {item.class}</TableCell>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell>{item.completed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;
