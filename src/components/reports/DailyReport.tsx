
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Format the selected date consistently as YYYY-MM-DD
  const formatDateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const selectedDateStr = formatDateToString(selectedDate);
  
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  console.log("=== DAILY REPORT DEBUG ===");
  console.log("Selected date object:", selectedDate);
  console.log("Formatted selected date:", selectedDateStr);
  console.log("Total lessons in storage:", lessons.length);
  console.log("All lesson dates from storage:", lessons.map((l: any) => ({ id: l.id, date: l.date, dateType: typeof l.date })));

  // Fixed filtering logic - ensure exact date match
  const dayLessons = lessons.filter((lesson: any) => {
    const lessonDate = lesson.date;
    
    // Ensure both dates are in the same format for comparison
    let normalizedLessonDate = lessonDate;
    if (lessonDate && typeof lessonDate === 'string') {
      // If lesson date is already a string, ensure it's in YYYY-MM-DD format
      if (lessonDate.includes('T')) {
        normalizedLessonDate = lessonDate.split('T')[0];
      }
    }
    
    const matches = normalizedLessonDate === selectedDateStr;
    console.log(`Lesson ${lesson.id}: original="${lessonDate}" normalized="${normalizedLessonDate}" vs selected="${selectedDateStr}" -> matches: ${matches}`);
    return matches;
  });

  console.log("Filtered lessons for selected date:", dayLessons.length);
  console.log("Lessons found:", dayLessons);
  console.log("=== END DAILY REPORT DEBUG ===");

  const getTeacherName = (teacherId: number) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Report - {format(selectedDate, "M/d/yyyy")}</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {dayLessons.length === 0 ? (
          <div>
            <p className="text-center text-muted-foreground py-8">
              No lessons recorded for {format(selectedDate, "M/d/yyyy")}.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Looking for date: {selectedDateStr}</p>
              <p>Total lessons: {lessons.length}</p>
              <p>Lesson dates: {lessons.map((l: any) => l.date).join(', ')}</p>
            </div>
          </div>
        ) : (
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
              {dayLessons.map((lesson: any) => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReport;
