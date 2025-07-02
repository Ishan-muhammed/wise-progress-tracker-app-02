import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects, classes } from "./constants";
import { SyllabusFormProps } from "./types";

const SyllabusForm = ({
  editingItem,
  formData,
  setFormData,
  onSubmit,
  onCancel
}: SyllabusFormProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingItem ? 'Edit' : 'Add'} Syllabus Item
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.class}
            onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls} value={cls}>
                  Class {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="total_lessons">Total Lessons</Label>
          <Input
            id="total_lessons"
            type="number"
            min="0"
            value={formData.total_lessons}
            onChange={(e) => setFormData(prev => ({ ...prev, total_lessons: e.target.value }))}
            placeholder="Enter total lessons"
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="bg-[#039559] hover:bg-[#039559]/90">
            {editingItem ? 'Update' : 'Add'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default SyllabusForm;