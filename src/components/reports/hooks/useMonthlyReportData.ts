
import { useMemo } from "react";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import { useSyllabusForReports } from "@/hooks/useSyllabusForReports";
import { getMonthDateRange } from "@/utils/academicYearUtils";

export const useMonthlyReportData = (
  selectedMonth: number,
  selectedAcademicYear: string,
  selectedClass: string | "all"
) => {
  // Calculate date range for selected month in academic year
  const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedAcademicYear);
  
  const {
    lessons,
    loading: lessonsLoading,
    error
  } = useLessonsInDateRange(startDate, endDate);
  
  const {
    getTotalLessons,
    loading: syllabusLoading
  } = useSyllabusForReports();

  // Filter lessons by selected class
  const filteredLessons = useMemo(() => {
    if (selectedClass === "all") return lessons;
    return lessons.filter(lesson => lesson.class === selectedClass);
  }, [lessons, selectedClass]);

  // Summary by class and subject
  const summary = useMemo(() => {
    const summaryData: any = {};
    filteredLessons.forEach(lesson => {
      const key = `${lesson.class}-${lesson.subject}`;
      if (!summaryData[key]) {
        summaryData[key] = {
          class: lesson.class,
          subject: lesson.subject,
          completed: 0,
          totalLessonsInSyllabus: getTotalLessons(lesson.subject, lesson.class)
        };
      }
      if (lesson.completed) summaryData[key].completed++;
    });
    return summaryData;
  }, [filteredLessons, getTotalLessons]);

  const isLoading = lessonsLoading || syllabusLoading;

  return {
    summary,
    isLoading,
    error,
    startDate,
    endDate,
    lessonsCount: lessons.length
  };
};
