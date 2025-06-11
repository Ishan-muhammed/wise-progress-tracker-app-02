
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
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

  // Function to clear data for a specific date
  const clearDataForDate = (dateStr: string) => {
    const updatedLessons = lessons.filter((lesson: any) => {
      let lessonDateStr = lesson.date;
      
      if (typeof lessonDateStr === 'string') {
        if (lessonDateStr.includes('T')) {
          lessonDateStr = lessonDateStr.split('T')[0];
        }
        if (lessonDateStr.includes('/')) {
          const parts = lessonDateStr.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            lessonDateStr = `${year}-${month}-${day}`;
          }
        }
      }
      
      return lessonDateStr !== dateStr;
    });
    
    localStorage.setItem("lessonCompletions", JSON.stringify(updatedLessons));
    window.location.reload(); // Refresh to show updated data
  };

  console.log("=== DAILY REPORT DEBUG ===");
  console.log("Selected date object:", selectedDate);
  console.log("Formatted selected date:", selectedDateStr);
  console.log("Total lessons in storage:", lessons.length);
  console.log("All lesson dates from storage:", lessons.map((l: any) => ({ id: l.id, date: l.date, dateType: typeof l.date })));

  // Improved filtering logic with strict date matching
  const dayLessons = lessons.filter((lesson: any) => {
    if (!lesson.date) {
      console.log(`Lesson ${lesson.id}: No date found`);
      return false;
    }
    
    let lessonDateStr = lesson.date;
    
    // Handle different date formats and normalize to YYYY-MM-DD
    if (typeof lessonDateStr === 'string') {
      // If it's an ISO string with time, extract just the date part
      if (lessonDateStr.includes('T')) {
        lessonDateStr = lessonDateStr.split('T')[0];
      }
      // Convert M/D/YYYY to YYYY-MM-DD
      else if (lessonDateStr.includes('/')) {
        const parts = lessonDateStr.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          lessonDateStr = `${year}-${month}-${day}`;
        }
      }
      // Convert MM-DD-YYYY to YYYY-MM-DD
      else if (lessonDateStr.includes('-') && lessonDateStr.length === 10) {
        const parts = lessonDateStr.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          const month = parts[0];
          const day = parts[1];
          const year = parts[2];
          lessonDateStr = `${year}-${month}-${day}`;
        }
      }
    }
    
    const isExactMatch = lessonDateStr === selectedDateStr;
    console.log(`Lesson ${lesson.id}: original="${lesson.date}" normalized="${lessonDateStr}" vs selected="${selectedDateStr}" -> exact match: ${isExactMatch}`);
    
    return isExactMatch;
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearDataForDate(selectedDateStr)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear Data
            </Button>
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
