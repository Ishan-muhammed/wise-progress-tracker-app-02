
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateAcademicYears, getMonthsInAcademicYear } from "@/utils/academicYearUtils";

const ALL_CLASSES = ['8', '9', '10', '11', '12'];
const academicYears = generateAcademicYears(2025, 5);
const academicMonths = getMonthsInAcademicYear();

interface MonthlyReportFiltersProps {
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedClass: string | "all";
  setSelectedClass: (classVal: string | "all") => void;
}

const MonthlyReportFilters = ({
  selectedAcademicYear,
  setSelectedAcademicYear,
  selectedMonth,
  setSelectedMonth,
  selectedClass,
  setSelectedClass
}: MonthlyReportFiltersProps) => {
  const currentMonthLabel = academicMonths.find(m => m.value === selectedMonth)?.label || 'Unknown';

  return (
    <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <span className="text-muted-foreground text-sm py-[20px] px-[12px]">Academic Year:</span>
        <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
          <SelectTrigger className="max-w-xs">
            <SelectValue>
              {selectedAcademicYear}
            </SelectValue>
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
      
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <span className="text-muted-foreground text-sm px-[12px]">Select Month:</span>
        <Select value={selectedMonth.toString()} onValueChange={value => setSelectedMonth(parseInt(value))}>
          <SelectTrigger className="max-w-xs">
            <SelectValue>
              {currentMonthLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {academicMonths.map(month => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
            {ALL_CLASSES.map(classVal => (
              <SelectItem key={classVal} value={classVal}>
                Class {classVal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MonthlyReportFilters;
