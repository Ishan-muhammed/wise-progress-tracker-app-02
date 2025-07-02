import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BookOpen, Users, FileText } from "lucide-react";

interface CompletedLessonsTableProps {
  lessons: any[];
  loading?: boolean;
}

const CompletedLessonsTable = ({ lessons, loading }: CompletedLessonsTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading lessons...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Completed Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed lessons found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Completed Lessons ({lessons.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Class
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Subject
                  </div>
                </TableHead>
                <TableHead>Lesson #</TableHead>
                <TableHead>Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">
                    {new Date(lesson.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Class {lesson.class}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lesson.subject}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {lesson.lesson_number}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {lesson.assessment ? (
                      <span className="text-sm text-muted-foreground truncate block">
                        {lesson.assessment}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No assessment
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedLessonsTable;