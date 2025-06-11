
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const DailyReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  console.log("=== DAILY REPORT DEBUG ===");
  console.log("Today's date (expected format):", today);
  console.log("Total lessons in storage:", lessons.length);
  console.log("All lesson dates from storage:", lessons.map((l: any) => ({ id: l.id, date: l.date, dateType: typeof l.date })));

  const todayLessons = lessons.filter((lesson: any) => {
    const lessonDate = lesson.date;
    const matches = lessonDate === today;
    console.log(`Lesson ${lesson.id}: date="${lessonDate}" vs today="${today}" -> matches: ${matches}`);
    return matches;
  });

  console.log("Filtered lessons for today:", todayLessons.length);
  console.log("=== END DAILY REPORT DEBUG ===");

  const getTeacherName = (teacherId: number) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  if (todayLessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Report - {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No lessons recorded for today.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Looking for date: {today}</p>
            <p>Total lessons: {lessons.length}</p>
            <p>Lesson dates: {lessons.map((l: any) => l.date).join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Report - {new Date().toLocaleDateString()}</CardTitle>
      </CardHeader>
      <CardContent>
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
            {todayLessons.map((lesson: any) => (
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
      </CardContent>
    </Card>
  );
};

export default DailyReport;
