
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateToString } from "@/utils/dateUtils";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import WeeklyReportHeader from "./WeeklyReportHeader";
import WeeklyReportContent from "./WeeklyReportContent";

const WeeklyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  
  // Calculate week range based on selected date
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

  const { lessons, loading, error } = useLessonsInDateRange(weekStartStr, weekEndStr);

  // Get unique classes from lessons and sort them
  const classSet = new Set<string>();
  lessons.forEach((lesson) => classSet.add(String(lesson.class)));
  const allClasses: string[] = Array.from(classSet)
    .sort((a: string, b: string) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });

  // Filter by class if a specific class is selected
  const filteredLessons = selectedClass !== "all" 
    ? lessons.filter((lesson) => lesson.class === selectedClass)
    : lessons;

  // Summary by teacher
  const teacherSummary = lessons.reduce((acc: any[], lesson) => {
    const existingTeacher = acc.find(t => t.teacherId === lesson.user_id);
    if (existingTeacher) {
      existingTeacher.totalLessons++;
      if (lesson.completed) existingTeacher.completedLessons++;
    } else {
      acc.push({
        teacherId: lesson.user_id,
        teacherName: lesson.profiles?.name || 'Unknown Teacher',
        totalLessons: 1,
        completedLessons: lesson.completed ? 1 : 0
      });
    }
    return acc;
  }, []);

  // Summary by class and subject
  const classSummary: any = {};
  filteredLessons.forEach((lesson) => {
    const key = `${lesson.class}-${lesson.subject}-${lesson.user_id}`;
    if (!classSummary[key]) {
      classSummary[key] = {
        class: lesson.class,
        subject: lesson.subject,
        teacher: (lesson as any).profiles?.name || 'Unknown Teacher',
        completed: 0,
        total: 0,
        lessons: []
      };
    }
    classSummary[key].total++;
    classSummary[key].lessons.push(lesson.lesson_number);
    if (lesson.completed) classSummary[key].completed++;
  });

  // Sort lessons for each summary entry
  Object.values(classSummary).forEach((summary: any) => {
    summary.lessons.sort((a: string, b: string) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <WeeklyReportHeader
              weekStart={weekStart}
              weekEnd={weekEnd}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              allClasses={allClasses}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading lessons...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Error: {error}</div>
          ) : (
            <WeeklyReportContent
              weekLessons={filteredLessons}
              selectedClass={selectedClass}
              teacherSummary={teacherSummary}
              classSummary={classSummary}
              weekStartStr={weekStartStr}
              weekEndStr={weekEndStr}
              lessons={lessons}
              allClasses={allClasses}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
