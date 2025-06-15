
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { formatDateToString } from "@/utils/dateUtils";
import { useLessons } from "@/hooks/useLessons";
import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "./DatePicker";
import LessonsTable from "./LessonsTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

const DailyReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const { user, isAdmin } = useAuth();

  const selectedDateStr = formatDateToString(selectedDate);
  const { lessons, loading, error } = useLessons(selectedDateStr);

  // Get unique list of classes from lesson data for dropdown
  const classes = useMemo(() => {
    const classSet = new Set<string>();
    lessons.forEach((lesson) => {
      if (lesson.class) classSet.add(lesson.class);
    });
    return Array.from(classSet).sort();
  }, [lessons]);

  // Filter lessons as per selected class
  const filteredLessons = useMemo(() => {
    if (selectedClass === "all") return lessons;
    return lessons.filter((lesson) => lesson.class === selectedClass);
  }, [lessons, selectedClass]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>
            Daily Report - {format(selectedDate, "M/d/yyyy")}
          </CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <div className="flex gap-2">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin View" : "Teacher View"}
              </Badge>
              <Badge variant="outline">
                {filteredLessons.length} lessons
              </Badge>
            </div>
            <DatePicker 
              selectedDate={selectedDate} 
              onDateSelect={date => {
                setSelectedDate(date);
                setSelectedClass("all"); // Reset class filter on date change
              }} 
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row gap-2 md:items-center">
          <span className="text-muted-foreground text-sm">Filter by Class:</span>
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue>
                {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(classVal => (
                <SelectItem key={classVal} value={classVal}>
                  Class {classVal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading lessons...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : (
          <LessonsTable lessons={filteredLessons} />
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReport;
