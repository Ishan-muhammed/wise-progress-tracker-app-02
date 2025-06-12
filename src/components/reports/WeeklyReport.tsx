
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateToString } from "@/utils/dateUtils";
import WeeklyReportHeader from "./WeeklyReportHeader";
import WeeklyReportContent from "./WeeklyReportContent";

const WeeklyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  // Get unique classes from lessons and sort them in ascending order
  const allClasses = [...new Set(lessons.map((lesson: any) => lesson.class))]
    .sort((a, b) => {
      // Convert to numbers for proper numerical sorting
      const numA = parseInt(String(a));
      const numB = parseInt(String(b));
      return numA - numB;
    });

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
    
    // Count unique classes taught by this teacher
    const uniqueClasses = [...new Set(teacherLessons.map((l: any) => l.class))];
    
    return {
      teacher: teacher.name,
      classesCount: uniqueClasses.length,
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
          <WeeklyReportContent
            weekLessons={weekLessons}
            selectedClass={selectedClass}
            teacherSummary={teacherSummary}
            classSummary={classSummary}
            weekStartStr={weekStartStr}
            weekEndStr={weekEndStr}
            lessons={lessons}
            allClasses={allClasses}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
