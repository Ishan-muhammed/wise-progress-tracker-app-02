
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const subjects = [
  { name: "Aqeedah", totalLessons: 20 },
  { name: "Quran", totalLessons: 20 },
  { name: "Hadith", totalLessons: 20 },
  { name: "Tajweed", totalLessons: 20 },
  { name: "Fiqh", totalLessons: 20 },
  { name: "Arabic", totalLessons: 20 }
];

const classes = ["8", "9", "10", "11", "12"];

const YearlyReport = () => {
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  
  // Get current year's lessons
  const currentYear = new Date().getFullYear();
  const yearLessons = lessons.filter((lesson: any) => 
    new Date(lesson.date).getFullYear() === currentYear && lesson.completed
  );

  // Calculate summary for each class and subject
  const summary: any = [];
  
  classes.forEach(cls => {
    subjects.forEach(subject => {
      const classSubjectLessons = yearLessons.filter((lesson: any) => 
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yearly Summary - {currentYear}</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default YearlyReport;
