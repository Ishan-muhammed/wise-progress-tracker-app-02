
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classes, subjects, LessonFormData } from "./types";

interface ClassSubjectSectionProps {
  formData: LessonFormData;
  setFormData: (data: LessonFormData) => void;
}

const ClassSubjectSection = ({ formData, setFormData }: ClassSubjectSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="class">Class</Label>
        <Select value={formData.class} onValueChange={(value) => setFormData({...formData, class: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ClassSubjectSection;
