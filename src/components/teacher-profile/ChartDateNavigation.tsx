
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChartDateNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  periodType: 'weekly' | 'monthly';
  className?: string;
}

const ChartDateNavigation = ({ 
  currentDate, 
  onDateChange, 
  onPrevious, 
  onNext, 
  periodType,
  className 
}: ChartDateNavigationProps) => {
  const formatDate = () => {
    if (periodType === 'weekly') {
      return format(currentDate, "MMM dd, yyyy");
    }
    return format(currentDate, "MMM yyyy");
  };

  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-3 text-sm font-normal"
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {formatDate()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-gray-500">
        {periodType === 'weekly' ? 'Weekly View' : 'Monthly View'}
      </div>
    </div>
  );
};

export default ChartDateNavigation;
