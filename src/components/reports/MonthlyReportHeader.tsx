
import { useRef, useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateTablePDF } from "@/utils/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { getMonthsInAcademicYear } from "@/utils/academicYearUtils";
import MonthlyReportFilters from "./MonthlyReportFilters";

const academicMonths = getMonthsInAcademicYear();

interface MonthlyReportHeaderProps {
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedClass: string | "all";
  setSelectedClass: (classVal: string | "all") => void;
  hasData: boolean;
  tableRef: React.RefObject<HTMLTableElement>;
}

const MonthlyReportHeader = ({
  selectedAcademicYear,
  setSelectedAcademicYear,
  selectedMonth,
  setSelectedMonth,
  selectedClass,
  setSelectedClass,
  hasData,
  tableRef
}: MonthlyReportHeaderProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const currentMonthLabel = academicMonths.find(m => m.value === selectedMonth)?.label || 'Unknown';

  const handleDownloadPDF = async () => {
    if (!tableRef.current) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const filename = `monthly-report-${currentMonthLabel}-${selectedAcademicYear}.pdf`;
      const title = `Monthly Report - ${currentMonthLabel} (${selectedAcademicYear})`;
      
      await generateTablePDF(tableRef.current, filename, title);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <CardHeader>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>Monthly Report - {currentMonthLabel} ({selectedAcademicYear})</CardTitle>
        {hasData && (
          <Button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-[#039559] hover:bg-[#039559]/90"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        )}
      </div>
      <MonthlyReportFilters
        selectedAcademicYear={selectedAcademicYear}
        setSelectedAcademicYear={setSelectedAcademicYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
      />
    </CardHeader>
  );
};

export default MonthlyReportHeader;
