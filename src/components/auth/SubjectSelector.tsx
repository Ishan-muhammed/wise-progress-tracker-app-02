
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubjects } from "@/hooks/useSubjects";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubjectSelectorProps {
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
  roles?: string[];
}

export const SubjectSelector = ({ subjects, setSubjects, roles = [] }: SubjectSelectorProps) => {
  const { subjects: availableSubjects, loading, error } = useSubjects();

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setSubjects([...subjects, subject]);
    } else {
      setSubjects(subjects.filter(s => s !== subject));
    }
  };

  const isTeacherRole = roles.includes("teacher");
  
  console.log('SubjectSelector - Available subjects:', availableSubjects.length, 'Loading:', loading, 'Error:', error);

  return (
    <div className="space-y-2">
      <Label>Teaching Subjects {isTeacherRole ? "*" : "(Optional)"}</Label>
      {loading && (
        <div className="text-sm text-gray-500 p-2 border rounded">
          Loading subjects...
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error loading subjects: {error}. Please refresh the page and try again.
          </AlertDescription>
        </Alert>
      )}
      {!loading && !error && availableSubjects.length === 0 && (
        <Alert>
          <AlertDescription>
            No subjects available. Please contact an administrator.
          </AlertDescription>
        </Alert>
      )}
      {!loading && !error && availableSubjects.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-2 border rounded max-h-48 overflow-y-auto">
          {availableSubjects.map((subject) => (
            <div key={subject.id} className="flex items-center space-x-2">
              <Checkbox
                id={subject.name}
                checked={subjects.includes(subject.name)}
                onCheckedChange={(checked) => handleSubjectChange(subject.name, checked as boolean)}
              />
              <Label htmlFor={subject.name} className="text-sm cursor-pointer">
                {subject.name}
              </Label>
            </div>
          ))}
        </div>
      )}
      {subjects.length > 0 && (
        <div className="text-sm text-green-600 mt-2">
          Selected: {subjects.join(", ")}
        </div>
      )}
    </div>
  );
};
