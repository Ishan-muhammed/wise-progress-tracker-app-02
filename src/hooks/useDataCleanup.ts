
import { useEffect } from "react";
import { normalizeDateString } from "@/utils/dateUtils";

export const useDataCleanup = () => {
  useEffect(() => {
    const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
    const cutoffDate = "2025-06-11";
    
    const filteredLessons = lessons.filter((lesson: any) => {
      if (!lesson.date) return false;
      
      const normalizedDate = normalizeDateString(lesson.date);
      return normalizedDate >= cutoffDate;
    });
    
    // Only update if we actually removed some lessons
    if (filteredLessons.length !== lessons.length) {
      localStorage.setItem("lessonCompletions", JSON.stringify(filteredLessons));
    }
  }, []);
};
