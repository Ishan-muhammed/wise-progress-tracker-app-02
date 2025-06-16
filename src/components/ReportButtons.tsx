
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyReport from "@/components/reports/DailyReport";
import WeeklyReport from "@/components/reports/WeeklyReport";
import MonthlyReport from "@/components/reports/MonthlyReport";
import YearlyReport from "@/components/reports/YearlyReport";

type ReportType = "daily" | "weekly" | "monthly" | "yearly" | null;

const ReportButtons = () => {
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const renderReport = () => {
    switch (activeReport) {
      case "daily":
        return <DailyReport />;
      case "weekly":
        return <WeeklyReport />;
      case "monthly":
        return <MonthlyReport />;
      case "yearly":
        return <YearlyReport />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => setActiveReport("daily")}
              variant={activeReport === "daily" ? "default" : "outline"}
              className={`h-20 flex flex-col ${
                activeReport === "daily" 
                  ? "bg-[#019455] hover:bg-[#017a45] text-white" 
                  : ""
              }`}
            >
              <span className="text-lg font-semibold">Daily</span>
              <span className="text-sm text-muted-foreground">Today's Lessons</span>
            </Button>
            
            <Button
              onClick={() => setActiveReport("weekly")}
              variant={activeReport === "weekly" ? "default" : "outline"}
              className={`h-20 flex flex-col ${
                activeReport === "weekly" 
                  ? "bg-[#019455] hover:bg-[#017a45] text-white" 
                  : ""
              }`}
            >
              <span className="text-lg font-semibold">Weekly</span>
              <span className="text-sm text-muted-foreground">This Week</span>
            </Button>
            
            <Button
              onClick={() => setActiveReport("monthly")}
              variant={activeReport === "monthly" ? "default" : "outline"}
              className={`h-20 flex flex-col ${
                activeReport === "monthly" 
                  ? "bg-[#019455] hover:bg-[#017a45] text-white" 
                  : ""
              }`}
            >
              <span className="text-lg font-semibold">Monthly</span>
              <span className="text-sm text-muted-foreground">This Month</span>
            </Button>
            
            <Button
              onClick={() => setActiveReport("yearly")}
              variant={activeReport === "yearly" ? "default" : "outline"}
              className={`h-20 flex flex-col ${
                activeReport === "yearly" 
                  ? "bg-[#019455] hover:bg-[#017a45] text-white" 
                  : ""
              }`}
            >
              <span className="text-lg font-semibold">Yearly</span>
              <span className="text-sm text-muted-foreground">Annual Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeReport && (
        <div className="mt-6">
          {renderReport()}
        </div>
      )}
    </div>
  );
};

export default ReportButtons;
