import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CompletedLessonsFiltersProps {
  classFilter: string;
  onClassFilterChange: (value: string) => void;
  subjectFilter: string;
  onSubjectFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  availableClasses: string[];
  availableSubjects: string[];
}

const CompletedLessonsFilters = ({
  classFilter,
  onClassFilterChange,
  subjectFilter,
  onSubjectFilterChange,
  searchTerm,
  onSearchTermChange,
  availableClasses,
  availableSubjects
}: CompletedLessonsFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Lessons
        </Label>
        <Input
          id="search"
          placeholder="Search by lesson number or assessment..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div className="flex-1">
        <Label htmlFor="class-filter" className="text-sm font-medium">
          Filter by Class
        </Label>
        <Select value={classFilter} onValueChange={onClassFilterChange}>
          <SelectTrigger id="class-filter" className="mt-1">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {availableClasses.map(cls => (
              <SelectItem key={cls} value={cls}>
                Class {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1">
        <Label htmlFor="subject-filter" className="text-sm font-medium">
          Filter by Subject
        </Label>
        <Select value={subjectFilter} onValueChange={onSubjectFilterChange}>
          <SelectTrigger id="subject-filter" className="mt-1">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {availableSubjects.map(subject => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CompletedLessonsFilters;