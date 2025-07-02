import { SyllabusEmptyStateProps } from "./types";

const SyllabusEmptyState = ({ selectedClass }: SyllabusEmptyStateProps) => {
  return (
    <p className="text-center text-muted-foreground py-8">
      {selectedClass === "all" 
        ? "No syllabus items found. Click \"Add Syllabus Item\" to get started."
        : `No syllabus items found for Class ${selectedClass}.`
      }
    </p>
  );
};

export default SyllabusEmptyState;