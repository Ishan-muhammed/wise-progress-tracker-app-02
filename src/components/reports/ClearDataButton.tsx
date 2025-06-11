
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { normalizeDateString } from "@/utils/dateUtils";

interface ClearDataButtonProps {
  selectedDateStr: string;
}

const ClearDataButton = ({ selectedDateStr }: ClearDataButtonProps) => {
  const clearDataForDate = (dateStr: string) => {
    const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
    const updatedLessons = lessons.filter((lesson: any) => {
      const normalizedLessonDate = normalizeDateString(lesson.date);
      return normalizedLessonDate !== dateStr;
    });
    
    localStorage.setItem("lessonCompletions", JSON.stringify(updatedLessons));
    window.location.reload();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => clearDataForDate(selectedDateStr)}
      className="text-red-600 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Clear Data
    </Button>
  );
};

export default ClearDataButton;
