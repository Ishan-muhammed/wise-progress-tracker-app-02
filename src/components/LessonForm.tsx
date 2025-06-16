
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClassSubjectSection from "./lesson-form/ClassSubjectSection";
import LessonDateSection from "./lesson-form/LessonDateSection";
import LessonStatusSection from "./lesson-form/LessonStatusSection";
import AssessmentSection from "./lesson-form/AssessmentSection";
import { useLessonSubmission } from "./lesson-form/useLessonSubmission";
import { LessonFormData } from "./lesson-form/types";

interface LessonFormProps {
  teacherId: string;
}

const LessonForm = ({ teacherId }: LessonFormProps) => {
  const [formData, setFormData] = useState<LessonFormData>({
    class: "",
    subject: "",
    lessonNumber: "",
    date: "",
    completed: false,
    assessment: ""
  });
  
  const { submitLesson, loading } = useLessonSubmission(teacherId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitLesson(formData);
    if (success) {
      // Reset form
      setFormData({
        class: "",
        subject: "",
        lessonNumber: "",
        date: "",
        completed: false,
        assessment: ""
      });
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Lesson Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClassSubjectSection formData={formData} setFormData={setFormData} />
          <LessonDateSection formData={formData} setFormData={setFormData} />
          <LessonStatusSection formData={formData} setFormData={setFormData} />
          <AssessmentSection formData={formData} setFormData={setFormData} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Lesson Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
