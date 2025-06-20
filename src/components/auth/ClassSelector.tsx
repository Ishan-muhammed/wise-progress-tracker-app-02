
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ClassSelectorProps {
  selectedClasses: string[];
  setSelectedClasses: (classes: string[]) => void;
}

const availableClasses = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

export const ClassSelector = ({ selectedClasses, setSelectedClasses }: ClassSelectorProps) => {
  const handleClassChange = (className: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses([...selectedClasses, className]);
    } else {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Classes Teaching *</Label>
      <div className="grid grid-cols-3 gap-3 p-3 border rounded-lg">
        {availableClasses.map((className) => (
          <div key={className} className="flex items-center space-x-2">
            <Checkbox
              id={`class-${className}`}
              checked={selectedClasses.includes(className)}
              onCheckedChange={(checked) => handleClassChange(className, checked as boolean)}
            />
            <Label htmlFor={`class-${className}`} className="text-sm">
              Class {className}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Select all classes you teach (at least one required)
      </p>
    </div>
  );
};
