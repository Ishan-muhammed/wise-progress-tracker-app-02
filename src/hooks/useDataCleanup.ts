
import { useEffect } from "react";
import { normalizeDateString } from "@/utils/dateUtils";

export const useDataCleanup = () => {
  useEffect(() => {
    // Clean initialization - remove any old demo data
    const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
    
    // Remove any lessons with invalid or demo-like data
    const validLessons = lessons.filter((lesson: any) => {
      // Keep only lessons with proper structure and valid dates
      return lesson.date && 
             lesson.class && 
             lesson.subject && 
             lesson.user_id && 
             !lesson.teacherId; // Remove old demo data format
    });
    
    // Update if we removed invalid lessons
    if (validLessons.length !== lessons.length) {
      localStorage.setItem("lessonCompletions", JSON.stringify(validLessons));
    }
  }, []);
};
