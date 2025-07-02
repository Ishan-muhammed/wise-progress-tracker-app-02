export interface SyllabusFormData {
  subject: string;
  class: string;
  total_lessons: string;
  academic_year: string;
}

export interface SyllabusHeaderProps {
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedAcademicYear: string;
  onAcademicYearChange: (value: string) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onResetForm: () => void;
}

export interface SyllabusFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any | null;
  formData: SyllabusFormData;
  setFormData: React.Dispatch<React.SetStateAction<SyllabusFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export interface SyllabusTableProps {
  syllabus: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export interface SyllabusEmptyStateProps {
  selectedClass: string;
}