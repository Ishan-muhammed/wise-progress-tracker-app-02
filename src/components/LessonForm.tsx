
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== LESSON FORM SUBMISSION DEBUG ===");
    console.log("Form submitted with data:", formData);
    console.log("Teacher ID:", teacherId);
    console.log("Date being saved:", formData.date);
    console.log("Date type:", typeof formData.date);

    // Basic validation - just check required fields
    if (!formData.class || !formData.subject || !formData.lessonNumber || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage (mock database)
    const existingData = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
    const newEntry = {
      id: Date.now(),
      teacherId,
      class: formData.class,
      subject: formData.subject,
      lessonNumber: formData.lessonNumber,
      date: formData.date, // This should be in YYYY-MM-DD format from the date input
      completed: formData.completed,
      assessment: formData.assessment,
      submittedAt: new Date().toISOString()
    };
    
    existingData.push(newEntry);
    localStorage.setItem("lessonCompletions", JSON.stringify(existingData));

    console.log("Data saved to localStorage:", newEntry);
    console.log("All lesson completions:", existingData);
    console.log("=== END LESSON FORM SUBMISSION DEBUG ===");

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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={formData.completed}
              onCheckedChange={(checked) => setFormData({...formData, completed: checked as boolean})}
            />
            <Label htmlFor="completed">Lesson Finished</Label>
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

          <Button type="submit" className="w-full">
            Submit Lesson Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
