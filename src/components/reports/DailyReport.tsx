
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatDateToString, filterLessonsByDate } from "@/utils/dateUtils";
import { useDataCleanup } from "@/hooks/useDataCleanup";
import DatePicker from "./DatePicker";
import LessonsTable from "./LessonsTable";
import ClearDataButton from "./ClearDataButton";

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Clean up old data on component mount
  useDataCleanup();
  
  const selectedDateStr = formatDateToString(selectedDate);
  const lessons = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
  const users = [
    { id: 1, name: "Ahmad Hassan" },
    { id: 2, name: "Fatima Ali" }
  ];

  const dayLessons = filterLessonsByDate(lessons, selectedDateStr);

  const getTeacherName = (teacherId: number) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher ? teacher.name : "Unknown Teacher";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Report - {format(selectedDate, "M/d/yyyy")}</CardTitle>
          <div className="flex items-center gap-2">
            <ClearDataButton selectedDateStr={selectedDateStr} />
            <DatePicker 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <LessonsTable lessons={dayLessons} getTeacherName={getTeacherName} />
      </CardContent>
    </Card>
  );
};

export default DailyReport;
