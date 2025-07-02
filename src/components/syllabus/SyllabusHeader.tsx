import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { classes } from "./constants";
import { SyllabusHeaderProps } from "./types";
import { generateAcademicYears, getCurrentAcademicYear } from "@/utils/academicYearUtils";

const SyllabusHeader = ({
  selectedClass,
  onClassChange,
  selectedAcademicYear,
  onAcademicYearChange,
  isAddDialogOpen,
  setIsAddDialogOpen,
  onResetForm
}: SyllabusHeaderProps) => {
  const academicYears = generateAcademicYears(2025, 5);
  return (
    <div className="space-y-4">
      {/* First row: Title */}
      <div className="text-center sm:text-left">
        <CardTitle>Syllabus Management</CardTitle>
      </div>
      
      {/* Second row: Academic Year and Class filters */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Academic Year:</span>
            <Select value={selectedAcademicYear} onValueChange={onAcademicYearChange}>
              <SelectTrigger className="w-40">
                <SelectValue>
                  {selectedAcademicYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.label} value={year.label}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by Class:</span>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="w-40">
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
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) onResetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#039559] hover:bg-[#039559]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Syllabus Item
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};

export default SyllabusHeader;