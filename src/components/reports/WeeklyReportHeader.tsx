
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/reports/DatePicker";

interface WeeklyReportHeaderProps {
  weekStart: Date;
  weekEnd: Date;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  allClasses: string[];
}

const WeeklyReportHeader = ({
  weekStart,
  weekEnd,
  selectedClass,
  onClassChange,
  selectedDate,
  onDateSelect,
  allClasses
}: WeeklyReportHeaderProps) => {
  // Filter classes to only show 8-12
  const filteredClasses = allClasses.filter(className => {
    const classNum = parseInt(className);
    return classNum >= 8 && classNum <= 12;
  });

  return (
    <div className="space-y-4">
      {/* First row: Title and date range */}
      <div className="text-center sm:text-left">
        <span className="text-lg font-medium">
          Weekly Report - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}
        </span>
      </div>
      
      {/* Second row: Class selector and Date picker */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Class:</span>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {filteredClasses.map((className: string) => (
                <SelectItem key={className} value={className}>
                  Class {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DatePicker 
          selectedDate={selectedDate} 
          onDateSelect={onDateSelect}
        />
      </div>
    </div>
  );
};

export default WeeklyReportHeader;
