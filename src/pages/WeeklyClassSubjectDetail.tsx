
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import LessonsTable from "@/components/reports/LessonsTable";

const WeeklyClassSubjectDetail = () => {
  const { class: classParam, subject, teacher, weekStart, weekEnd } = useParams();
  const navigate = useNavigate();

  const { lessons, loading, error } = useLessonsInDateRange(weekStart!, weekEnd!);

  // Filter lessons for the specific class, subject, and teacher
  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.class === classParam &&
      lesson.subject === subject &&
      lesson.profiles?.name === decodeURIComponent(teacher!)
  );

  const weekStartDate = new Date(weekStart!);
  const weekEndDate = new Date(weekEnd!);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Weekly Report
          </Button>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Weekly Lesson Details
            </h1>
            <div className="text-blue-700 space-y-1">
              <p><strong>Class:</strong> {classParam}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Teacher:</strong> {decodeURIComponent(teacher!)}</p>
              <p><strong>Week:</strong> {weekStartDate.toLocaleDateString()} - {weekEndDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Lessons for Class {classParam} - {subject}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading lessons...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">Error: {error}</div>
            ) : (
              <LessonsTable 
                lessons={filteredLessons}
                emptyText={`No lessons found for Class ${classParam} - ${subject} during this week.`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyClassSubjectDetail;
