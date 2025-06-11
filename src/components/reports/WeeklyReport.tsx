
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WeeklyReport = () => {
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  // Get current week's lessons - fix date calculation
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  console.log("=== WEEKLY REPORT DEBUG ===");
  console.log("Week start date:", weekStartStr);
  console.log("Week end date:", weekEndStr);
  console.log("Total lessons in storage:", lessons.length);
  console.log("All lesson dates:", lessons.map((l: any) => l.date));

  const weekLessons = lessons.filter((lesson: any) => {
    const lessonDate = lesson.date;
    const isInRange = lessonDate >= weekStartStr && lessonDate <= weekEndStr;
    console.log(`Lesson ${lesson.id}: date="${lessonDate}" in range [${weekStartStr} to ${weekEndStr}] -> ${isInRange}`);
    return isInRange;
  });

  console.log("Filtered lessons for this week:", weekLessons.length);
  console.log("=== END WEEKLY REPORT DEBUG ===");

  // Summary by teacher
  const teacherSummary = users.map(teacher => {
    const teacherLessons = weekLessons.filter((l: any) => l.teacherId === teacher.id);
    return {
      teacher: teacher.name,
      totalLessons: teacherLessons.length,
      completedLessons: teacherLessons.filter((l: any) => l.completed).length
    };
  });

  // Summary by class and subject
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

  if (weekLessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Report - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No lessons recorded for this week.
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Week range: {weekStartStr} to {weekEndStr}</p>
            <p>Total lessons: {lessons.length}</p>
            <p>Lesson dates: {lessons.map((l: any) => l.date).join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Report - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
