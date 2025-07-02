import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useLessonsInDateRange } from "@/hooks/useLessonsInDateRange";
import { generateTablePDF } from "@/utils/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import LessonsTable from "@/components/reports/LessonsTable";
const WeeklyClassSubjectDetail = () => {
  const {
    class: classParam,
    subject,
    teacher,
    weekStart,
    weekEnd
  } = useParams();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const {
    lessons,
    loading,
    error
  } = useLessonsInDateRange(weekStart!, weekEnd!);

  // Filter lessons for the specific class, subject, and teacher
  const filteredLessons = lessons.filter(lesson => lesson.class === classParam && lesson.subject === subject && lesson.profiles?.name === decodeURIComponent(teacher!));
  const weekStartDate = new Date(weekStart!);
  const weekEndDate = new Date(weekEnd!);
  const handleDownloadPDF = async () => {
    if (!reportRef.current || filteredLessons.length === 0) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const filename = `lesson-details-${classParam}-${subject}-${weekStart}-to-${weekEnd}.pdf`;
      const title = `Lesson Details - Class ${classParam} - ${subject} (${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()})`;
      await generateTablePDF(reportRef.current, filename, title);
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
  return <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 bg-[#039559] text-slate-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Weekly Report
          </Button>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Weekly Lesson Details
            </h1>
            <div className="text-blue-700 space-y-1">
              <p><strong>Class:</strong> {classParam}</p>
              <p><strong>Subject:</strong> {subject}</p>
              <p><strong>Teacher:</strong> {decodeURIComponent(teacher!)}</p>
              <p><strong>Week:</strong> {weekStartDate.toLocaleDateString()} - {weekEndDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>
                Lessons for Class {classParam} - {subject}
              </CardTitle>
              {filteredLessons.length > 0 && <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-[#039559] hover:bg-[#039559]/90">
                  <Download className="w-4 h-4 mr-2" />
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </Button>}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-8">Loading lessons...</div> : error ? <div className="text-center py-8 text-red-500">Error: {error}</div> : <div ref={reportRef}>
                <LessonsTable lessons={filteredLessons} emptyText={`No lessons found for Class ${classParam} - ${subject} during this week.`} />
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default WeeklyClassSubjectDetail;