
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subjects, LessonFormData } from "./types";

interface LessonDateSectionProps {
  formData: LessonFormData;
  setFormData: (data: LessonFormData) => void;
}

const LessonDateSection = ({ formData, setFormData }: LessonDateSectionProps) => {
  const selectedSubject = subjects.find(s => s.name === formData.subject);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="lessonNumber">
          Lesson
          {selectedSubject && (
            <span className="text-sm text-gray-500"> (1-{selectedSubject.totalLessons})</span>
          )}
        </Label>
        <Input
          id="lessonNumber"
          type="text"
          value={formData.lessonNumber}
          onChange={(e) => setFormData({...formData, lessonNumber: e.target.value})}
          placeholder="Enter lesson"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>
    </div>
  );
};

export default LessonDateSection;
