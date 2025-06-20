
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAcademicYear, getMonthsInAcademicYear } from "@/utils/academicYearUtils";
import { useMonthlyReportData } from "./hooks/useMonthlyReportData";
import MonthlyReportHeader from "./MonthlyReportHeader";
import MonthlyReportTable from "./MonthlyReportTable";

const academicMonths = getMonthsInAcademicYear();

const MonthlyReport = () => {
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(getCurrentAcademicYear());
  const tableRef = useRef<HTMLTableElement>(null);

  const {
    summary,
    isLoading,
    error,
    startDate,
    endDate,
    lessonsCount
  } = useMonthlyReportData(selectedMonth, selectedAcademicYear, selectedClass);

  console.log("Monthly Report - Academic year:", selectedAcademicYear);
  console.log("Monthly Report - Month:", selectedMonth);
  console.log("Monthly Report - Date range:", startDate, "to", endDate);
  console.log("Monthly Report - Lessons from Supabase:", lessonsCount);

  // Get current month label
  const currentMonthLabel = academicMonths.find(m => m.value === selectedMonth)?.label || 'Unknown';

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">Loading lessons...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const hasData = Object.keys(summary).length > 0;

  return (
    <Card>
      <MonthlyReportHeader
        selectedAcademicYear={selectedAcademicYear}
        setSelectedAcademicYear={setSelectedAcademicYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        hasData={hasData}
        tableRef={tableRef}
      />
      <CardContent>
        <MonthlyReportTable
          ref={tableRef}
          summary={summary}
          selectedClass={selectedClass}
          selectedMonth={selectedMonth}
          selectedAcademicYear={selectedAcademicYear}
        />
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;
