
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LessonFormData } from "./types";

export const useLessonSubmission = (teacherId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitLesson = async (formData: LessonFormData) => {
    console.log("=== LESSON FORM SUBMISSION (SUPABASE) ===");
    console.log("Form submitted with data:", formData);
    console.log("Teacher ID:", teacherId);
    console.log("Date being saved:", formData.date);

    // Basic validation
    if (!formData.class || !formData.subject || !formData.lessonNumber || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);

    try {
      // Insert lesson into Supabase
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          user_id: teacherId,
          class: formData.class,
          subject: formData.subject,
          lesson_number: formData.lessonNumber,
          date: formData.date,
          completed: formData.completed,
          assessment: formData.assessment || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving lesson:', error);
        toast({
          title: "Error",
          description: "Failed to save lesson. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Lesson saved to Supabase:", data);
      console.log("=== END LESSON FORM SUBMISSION (SUPABASE) ===");

      toast({
        title: "Lesson Submitted",
        description: "Your lesson data has been successfully saved!",
      });

      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitLesson, loading };
};
