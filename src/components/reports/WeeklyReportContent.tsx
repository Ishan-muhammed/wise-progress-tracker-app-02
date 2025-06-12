
import TeacherSummaryTable from "./TeacherSummaryTable";
import ClassSummaryTable from "./ClassSummaryTable";

interface TeacherSummary {
  teacherId: string;
  totalLessons: number;
  completedLessons: number;
}

interface ClassSummary {
  class: string;
  subject: string;
  completed: number;
  total: number;
  teacher: string;
  lessons: string[];
}

interface WeeklyReportContentProps {
  weekLessons: any[];
  selectedClass: string;
  teacherSummary: TeacherSummary[];
  classSummary: Record<string, ClassSummary>;
  weekStartStr: string;
  weekEndStr: string;
  lessons: any[];
  allClasses: string[];
}

const WeeklyReportContent = ({
  weekLessons,
  selectedClass,
  teacherSummary,
  classSummary,
  weekStartStr,
  weekEndStr,
  lessons,
  allClasses
}: WeeklyReportContentProps) => {
  if (weekLessons.length === 0) {
    return (
      <div>
        <p className="text-center text-muted-foreground py-8">
          No lessons recorded for this week{selectedClass !== "all" ? ` in Class ${selectedClass}` : ""}.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Week range: {weekStartStr} to {weekEndStr}</p>
          <p>Selected class: {selectedClass}</p>
          <p>Total lessons: {lessons.length}</p>
          <p>Available classes: {allClasses.join(', ')}</p>
          <p>Lesson dates: {lessons.map((l: any) => l.date).join(', ')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedClass !== "all" && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">
            Class {selectedClass} Weekly Summary
          </h3>
          <p className="text-blue-700">
            Showing {weekLessons.length} lesson(s) for the selected week
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeacherSummaryTable teacherSummary={teacherSummary} />
        <ClassSummaryTable classSummary={classSummary} />
      </div>
    </div>
  );
};

export default WeeklyReportContent;
