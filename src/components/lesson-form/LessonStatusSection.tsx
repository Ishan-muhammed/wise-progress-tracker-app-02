
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LessonFormData } from "./types";

interface LessonStatusSectionProps {
  formData: LessonFormData;
  setFormData: (data: LessonFormData) => void;
}

const LessonStatusSection = ({ formData, setFormData }: LessonStatusSectionProps) => {
  return (
    <div className="space-y-3">
      <Label>Lesson Status</Label>
      <RadioGroup
        value={formData.completed ? "finished" : "not-finished"}
        onValueChange={(value) => setFormData({...formData, completed: value === "finished"})}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="finished" id="finished" />
          <Label htmlFor="finished">Lesson Finished</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="not-finished" id="not-finished" />
          <Label htmlFor="not-finished">Not Finished</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default LessonStatusSection;
