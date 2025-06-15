
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubjects } from "@/hooks/useSubjects";

interface SubjectSelectorProps {
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
}

export const SubjectSelector = ({ subjects, setSubjects }: SubjectSelectorProps) => {
  const { subjects: availableSubjects, loading, error } = useSubjects();

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setSubjects([...subjects, subject]);
    } else {
      setSubjects(subjects.filter(s => s !== subject));
    }
  };

  // DEBUG LOG
  console.log('Available subjects in SubjectSelector:', availableSubjects, 'Loading:', loading, 'Error:', error);

  return (
    <div className="space-y-2">
      <Label>Teaching Subjects</Label>
      {loading && <div className="text-sm text-gray-500">Loading subjects...</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
      <div className="grid grid-cols-2 gap-2">
        {availableSubjects.map((subject) => (
          <div key={subject.id} className="flex items-center space-x-2">
            <Checkbox
              id={subject.name}
              checked={subjects.includes(subject.name)}
              onCheckedChange={(checked) => handleSubjectChange(subject.name, checked as boolean)}
            />
            <Label htmlFor={subject.name} className="text-sm">{subject.name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
