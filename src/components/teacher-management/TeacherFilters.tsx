import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateAcademicYears, getCurrentAcademicYear } from "@/utils/academicYearUtils";

interface TeacherFiltersProps {
  statusFilter: 'active' | 'archived';
  onStatusFilterChange: (status: 'active' | 'archived') => void;
  academicYear: string;
  onAcademicYearChange: (year: string) => void;
}

const TeacherFilters = ({ 
  statusFilter, 
  onStatusFilterChange, 
  academicYear, 
  onAcademicYearChange 
}: TeacherFiltersProps) => {
  const academicYears = generateAcademicYears();

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Teacher Status
        </Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status-filter" className="mt-1">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active Teachers</SelectItem>
            <SelectItem value="archived">Archived Teachers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1">
        <Label htmlFor="academic-year" className="text-sm font-medium text-gray-700">
          Academic Year
        </Label>
        <Select value={academicYear} onValueChange={onAcademicYearChange}>
          <SelectTrigger id="academic-year" className="mt-1">
            <SelectValue placeholder="Select academic year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map(year => (
              <SelectItem key={year.label} value={year.label}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TeacherFilters;