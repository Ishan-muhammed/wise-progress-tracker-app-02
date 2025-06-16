
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LessonFormData } from "./types";

interface AssessmentSectionProps {
  formData: LessonFormData;
  setFormData: (data: LessonFormData) => void;
}

const AssessmentSection = ({ formData, setFormData }: AssessmentSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="assessment">Assessment Notes</Label>
      <Textarea
        id="assessment"
        value={formData.assessment}
        onChange={(e) => setFormData({...formData, assessment: e.target.value})}
        placeholder="Enter any additional notes about the lesson..."
        rows={4}
      />
    </div>
  );
};

export default AssessmentSection;
