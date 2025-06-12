
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/reports/DatePicker";
import { formatDateToString } from "@/utils/dateUtils";

const WeeklyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  // Get unique classes from lessons
  const allClasses = [...new Set(lessons.map((lesson: any) => lesson.class))].sort();

  // Calculate week start and end based on selected date
  const getWeekRange = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekRange(selectedDate);
  const weekStartStr = formatDateToString(weekStart);
  const weekEndStr = formatDateToString(weekEnd);

  console.log("=== WEEKLY REPORT DEBUG ===");
  console.log("Selected date:", formatDateToString(selectedDate));
  console.log("Selected class:", selectedClass);
  console.log("Week start date:", weekStartStr);
  console.log("Week end date:", weekEndStr);
  console.log("Total lessons in storage:", lessons.length);

  let weekLessons = lessons.filter((lesson: any) => {
    const lessonDate = lesson.date;
    const isInRange = lessonDate >= weekStartStr && lessonDate <= weekEndStr;
    console.log(`Lesson ${lesson.id}: date="${lessonDate}" in range [${weekStartStr} to ${weekEndStr}] -> ${isInRange}`);
    return isInRange;
  });

  // Filter by class if a specific class is selected
  if (selectedClass !== "all") {
    weekLessons = weekLessons.filter((lesson: any) => lesson.class === selectedClass);
    console.log("Filtered lessons for selected class:", weekLessons.length);
  }

  console.log("Final filtered lessons:", weekLessons.length);
  console.log("=== END WEEKLY REPORT DEBUG ===");

  // Summary by teacher (for selected class or all classes)
  const teacherSummary = users.map(teacher => {
    const teacherLessons = weekLessons.filter((l: any) => l.teacherId === teacher.id);
    return {
      teacher: teacher.name,
      totalLessons: teacherLessons.length,
      completedLessons: teacherLessons.filter((l: any) => l.completed).length
    };
  });

  // Summary by class and subject (filtered by selected class)
  const classSummary: any = {};
  weekLessons.forEach((lesson: any) => {
    const key = `${lesson.class}-${lesson.subject}`;
    if (!classSummary[key]) {
      classSummary[key] = {
        class: lesson.class,
        subject: lesson.subject,
        completed: 0,
        total: 0
      };
    }
    classSummary[key].total++;
    if (lesson.completed) classSummary[key].completed++;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weekly Report - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Class:</span>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {allClasses.map((className: string) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DatePicker 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weekLessons.length === 0 ? (
            <div>
              <p className="text-center text-muted-foreground py-8">
                No lessons recorded for this week{selectedClass !== "all" ? ` in Class ${selectedClass}` : ""}.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Week range: {weekStartStr} to {weekEndStr}</p>
                <p>Selected class: {selectedClass}</p>
                <p>Total lessons: {lessons.length}</p>
                <p>Available classes: {allClasses.join(', ')}</p>
                <p>Lesson dates: {lessons.map((l: any) => l.date).join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedClass !== "all" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Class {selectedClass} Weekly Summary
                  </h3>
                  <p className="text-blue-700">
                    Showing {weekLessons.length} lesson(s) for the selected week
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Summary by Teacher</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Total Lessons</TableHead>
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

                <div>
                  <h3 className="text-lg font-semibold mb-4">Summary by Class & Subject</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Completed/Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(classSummary).map((summary: any, index) => (
                        <TableRow key={index}>
                          <TableCell>Class {summary.class}</TableCell>
                          <TableCell>{summary.subject}</TableCell>
                          <TableCell>{summary.completed}/{summary.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
