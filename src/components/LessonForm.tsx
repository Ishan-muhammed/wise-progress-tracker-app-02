
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const classes = ["8", "9", "10", "11", "12"];
const subjects = [
  { name: "Aqeedah", totalLessons: 20 },
  { name: "Quran", totalLessons: 20 },
  { name: "Hadith", totalLessons: 20 },
  { name: "Tajweed", totalLessons: 20 },
  { name: "Fiqh", totalLessons: 20 },
  { name: "Arabic", totalLessons: 20 }
];

interface LessonFormProps {
  teacherId: string;
}

const LessonForm = ({ teacherId }: LessonFormProps) => {
  const [formData, setFormData] = useState({
    class: "",
    subject: "",
    lessonNumber: "",
    date: "",
    completed: false,
    assessment: ""
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      return;
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
        return;
      }

      console.log("Lesson saved to Supabase:", data);
      console.log("=== END LESSON FORM SUBMISSION (SUPABASE) ===");

      toast({
        title: "Lesson Submitted",
        description: "Your lesson data has been successfully saved!",
      });

      // Reset form
      setFormData({
        class: "",
        subject: "",
        lessonNumber: "",
        date: "",
        completed: false,
        assessment: ""
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.name === formData.subject);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Lesson Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Lesson Data"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
