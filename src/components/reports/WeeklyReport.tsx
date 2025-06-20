
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCw } from "lucide-react";
import DatePicker from "./DatePicker";
import WeeklyReportContent from "./WeeklyReportContent";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import { useToast } from "@/hooks/use-toast";
import { getStartOfWeek, formatDateForDisplay } from "@/utils/dateUtils";

const WeeklyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const startOfWeek = getStartOfWeek(selectedDate);
  const { toast } = useToast();
  
  const { 
    lessons, 
    loading, 
    error,
    refetch 
  } = useLessonsInDateRange(startOfWeek, 'week');

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Weekly report data has been updated.",
    });
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Weekly Report - {formatDateForDisplay(startOfWeek)}
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <DatePicker
              selectedDate={selectedDate}
              onDateSelect={(date) => date && setSelectedDate(date)}
            />
          </div>
          
          <WeeklyReportContent lessons={lessons} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyReport;
