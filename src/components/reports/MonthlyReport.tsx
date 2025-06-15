
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLessonsInDateRange } from "@/hooks/useLessons";

const MonthlyReport = () => {
  // Get current month's lessons
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const monthStartStr = monthStart.toISOString().split('T')[0];
  const monthEndStr = monthEnd.toISOString().split('T')[0];

  const { lessons, loading, error } = useLessonsInDateRange(monthStartStr, monthEndStr);

  console.log("Monthly Report - Date range:", monthStartStr, "to", monthEndStr);
  console.log("Monthly Report - Lessons from Supabase:", lessons.length);

  // Summary by class and subject
  const summary: any = {};
  lessons.forEach((lesson) => {
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

  if (Object.keys(summary).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Report - {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No lessons recorded for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Report - {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;
