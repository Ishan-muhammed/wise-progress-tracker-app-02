
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatDateToString } from "@/utils/dateUtils";
import { useLessons } from "@/hooks/useLessons";
import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "./DatePicker";
import LessonsTable from "./LessonsTable";
import { Badge } from "@/components/ui/badge";

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user, isAdmin } = useAuth();
  
  const selectedDateStr = formatDateToString(selectedDate);
  const { lessons, loading, error } = useLessons(selectedDateStr);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Report - {format(selectedDate, "M/d/yyyy")}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin View" : "Teacher View"}
              </Badge>
              <Badge variant="outline">
                {lessons.length} lessons
              </Badge>
            </div>
            <DatePicker 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading lessons...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <LessonsTable lessons={lessons} />
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReport;
