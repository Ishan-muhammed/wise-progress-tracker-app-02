
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

  console.log("Daily Report - Today's date:", today);
  console.log("Daily Report - All lessons:", lessons);

  const todayLessons = lessons.filter((lesson: any) => {
    console.log("Checking lesson date:", lesson.date, "against today:", today);
    return lesson.date === today;
  });

  console.log("Daily Report - Today's lessons:", todayLessons);

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
