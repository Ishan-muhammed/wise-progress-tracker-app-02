
import TeacherSummaryTable from "./TeacherSummaryTable";
import ClassSummaryTable from "./ClassSummaryTable";
import { TeacherSummary } from "./types";

interface ClassSummary {
  class: string;
  subject: string;
  completed: number;
  total: number;
  teacher: string;
  lessons: string[];
}

interface WeeklyReportContentProps {
  lessons: any[];
  loading: boolean;
}

const WeeklyReportContent = ({ lessons, loading }: WeeklyReportContentProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        Loading lessons...
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No lessons recorded for this week.
      </div>
    );
  }

  // Process lessons to create teacher and class summaries
  const teacherSummary: TeacherSummary[] = [];
  const classSummary: Record<string, ClassSummary> = {};

  // Group lessons by teacher
  const lessonsByTeacher: Record<string, any[]> = {};
  lessons.forEach(lesson => {
    if (!lessonsByTeacher[lesson.user_id]) {
      lessonsByTeacher[lesson.user_id] = [];
    }
    lessonsByTeacher[lesson.user_id].push(lesson);
  });

  // Create teacher summary
  Object.entries(lessonsByTeacher).forEach(([teacherId, teacherLessons]) => {
    const completed = teacherLessons.filter(l => l.completed).length;
    teacherSummary.push({
      teacher: `Teacher ${teacherId.slice(0, 8)}`, // Short ID for display
      completed,
      total: teacherLessons.length
    });
  });

  // Group lessons by class-subject
  lessons.forEach(lesson => {
    const key = `${lesson.class}-${lesson.subject}`;
    if (!classSummary[key]) {
      classSummary[key] = {
        class: lesson.class,
        subject: lesson.subject,
        completed: 0,
        total: 0,
        teacher: `Teacher ${lesson.user_id.slice(0, 8)}`,
        lessons: []
      };
    }
    classSummary[key].total++;
    if (lesson.completed) {
      classSummary[key].completed++;
    }
    classSummary[key].lessons.push(lesson.lesson_number);
  });

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">
          Weekly Summary
        </h3>
        <p className="text-blue-700">
          Showing {lessons.length} lesson(s) for the selected week
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeacherSummaryTable teacherSummary={teacherSummary} />
        <ClassSummaryTable 
          classSummary={classSummary} 
          weekStart=""
          weekEnd=""
        />
      </div>
    </div>
  );
};

export default WeeklyReportContent;
