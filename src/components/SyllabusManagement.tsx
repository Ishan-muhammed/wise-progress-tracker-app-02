import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useSyllabus, SyllabusItem } from "@/hooks/useSyllabus";
import { useToast } from "@/hooks/use-toast";
import SyllabusHeader from "./syllabus/SyllabusHeader";
import SyllabusForm from "./syllabus/SyllabusForm";
import SyllabusTable from "./syllabus/SyllabusTable";
import SyllabusEmptyState from "./syllabus/SyllabusEmptyState";
import { SyllabusFormData } from "./syllabus/types";

const SyllabusManagement = () => {
  const { syllabus, loading, error, addSyllabusItem, updateSyllabusItem, deleteSyllabusItem } = useSyllabus();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [formData, setFormData] = useState<SyllabusFormData>({
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

  const handleCancel = () => {
    resetForm();
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <SyllabusHeader
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            onResetForm={resetForm}
          />
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
          <SyllabusHeader
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            onResetForm={resetForm}
          />
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
        <SyllabusHeader
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          onResetForm={resetForm}
        />
      </CardHeader>
      <CardContent>
        {filteredSyllabus.length === 0 ? (
          <SyllabusEmptyState selectedClass={selectedClass} />
        ) : (
          <SyllabusTable
            syllabus={filteredSyllabus}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <SyllabusForm
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editingItem={editingItem}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </Card>
  );
};

export default SyllabusManagement;
