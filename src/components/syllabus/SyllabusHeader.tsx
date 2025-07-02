import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { classes } from "./constants";
import { SyllabusHeaderProps } from "./types";

const SyllabusHeader = ({
  selectedClass,
  onClassChange,
  isAddDialogOpen,
  setIsAddDialogOpen,
  onResetForm
}: SyllabusHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* First row: Title */}
      <div className="text-center sm:text-left">
        <CardTitle>Syllabus Management</CardTitle>
      </div>
      
      {/* Second row: Filter and Add button */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4">
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