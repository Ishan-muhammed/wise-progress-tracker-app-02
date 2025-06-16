
import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateToString } from "@/utils/dateUtils";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import WeeklyReportHeader from "./WeeklyReportHeader";
import WeeklyReportContent from "./WeeklyReportContent";

const WeeklyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  
  // Calculate week range based on selected date - memoized
  const { weekStart, weekEnd, weekStartStr, weekEndStr } = useMemo(() => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return {
      weekStart,
      weekEnd,
      weekStartStr: formatDateToString(weekStart),
      weekEndStr: formatDateToString(weekEnd)
    };
  }, [selectedDate]);

  const { lessons, loading, error } = useLessonsInDateRange(weekStartStr, weekEndStr);

  // Get unique classes from lessons and sort them - memoized
  const allClasses = useMemo(() => {
    const classSet = new Set<string>();
    lessons.forEach((lesson) => classSet.add(String(lesson.class)));
    return Array.from(classSet).sort((a: string, b: string) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  }, [lessons]);

  // Filter by class if a specific class is selected - memoized
  const filteredLessons = useMemo(() => {
    return selectedClass !== "all" 
      ? lessons.filter((lesson) => lesson.class === selectedClass)
      : lessons;
  }, [lessons, selectedClass]);

  // Summary by teacher - memoized
  const teacherSummary = useMemo(() => {
    return lessons.reduce((acc: any[], lesson) => {
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
  }, [lessons]);

  // Summary by class and subject - memoized
  const classSummary = useMemo(() => {
    const summary: any = {};
    filteredLessons.forEach((lesson) => {
      const key = `${lesson.class}-${lesson.subject}-${lesson.user_id}`;
      if (!summary[key]) {
        summary[key] = {
          class: lesson.class,
          subject: lesson.subject,
          teacher: (lesson as any).profiles?.name || 'Unknown Teacher',
          completed: 0,
          total: 0,
          lessons: []
        };
      }
      summary[key].total++;
      summary[key].lessons.push(lesson.lesson_number);
      if (lesson.completed) summary[key].completed++;
    });

    // Sort lessons for each summary entry
    Object.values(summary).forEach((summaryItem: any) => {
      summaryItem.lessons.sort((a: string, b: string) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
      });
    });

    return summary;
  }, [filteredLessons]);

  // Memoized handlers
  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <WeeklyReportHeader
              weekStart={weekStart}
              weekEnd={weekEnd}
              selectedClass={selectedClass}
              onClassChange={handleClassChange}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
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
