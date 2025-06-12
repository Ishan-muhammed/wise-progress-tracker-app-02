
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
  return (
    <div className="flex items-center justify-between">
      <span>Weekly Report - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Class:</span>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {allClasses.map((className: string) => (
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
