import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useSyllabus, SyllabusItem } from "@/hooks/useSyllabus";
import { useToast } from "@/hooks/use-toast";

const subjects = ["Aqeedah", "Quran", "Hadith", "Tajweed", "Fiqh", "Arabic"];
const classes = ["8", "9", "10", "11", "12"];

const SyllabusManagement = () => {
  const { syllabus, loading, error, addSyllabusItem, updateSyllabusItem, deleteSyllabusItem } = useSyllabus();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    total_lessons: ""
  });

  // Filter syllabus by selected class
  const filteredSyllabus = useMemo(() => {
    if (selectedClass === "all") return syllabus;
    return syllabus.filter(item => item.class === selectedClass);
  }, [syllabus, selectedClass]);

  const resetForm = () => {
    setFormData({ subject: "", class: "", total_lessons: "" });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.class || !formData.total_lessons) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const totalLessons = parseInt(formData.total_lessons);
    if (isNaN(totalLessons) || totalLessons < 0) {
      toast({
        title: "Error",
        description: "Total lessons must be a valid positive number",
        variant: "destructive"
      });
      return;
    }

    try {
      let result;
      if (editingItem) {
        result = await updateSyllabusItem(editingItem.id, {
          subject: formData.subject,
          class: formData.class,
          total_lessons: totalLessons
        });
      } else {
        result = await addSyllabusItem({
          subject: formData.subject,
          class: formData.class,
          total_lessons: totalLessons
        });
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Syllabus item ${editingItem ? 'updated' : 'added'} successfully`
        });
        resetForm();
        setIsAddDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save syllabus item",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: SyllabusItem) => {
    setEditingItem(item);
    setFormData({
      subject: item.subject,
      class: item.class,
      total_lessons: item.total_lessons.toString()
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this syllabus item?")) return;

    const result = await deleteSyllabusItem(id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Syllabus item deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete syllabus item",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Syllabus Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading syllabus...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Syllabus Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Syllabus Management</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <span className="text-muted-foreground text-sm px-[12px]">Filter by Class:</span>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue>
                    {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(classVal => (
                    <SelectItem key={classVal} value={classVal}>
                      Class {classVal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#039559] hover:bg-[#039559]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Syllabus Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit' : 'Add'} Syllabus Item
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                      onClick={() => {
                        resetForm();
                        setIsAddDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSyllabus.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {selectedClass === "all" 
              ? "No syllabus items found. Click \"Add Syyllabus Item\" to get started."
              : `No syllabus items found for Class ${selectedClass}.`
            }
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Total Lessons</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSyllabus.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.subject}</TableCell>
                  <TableCell>Class {item.class}</TableCell>
                  <TableCell>{item.total_lessons}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SyllabusManagement;
