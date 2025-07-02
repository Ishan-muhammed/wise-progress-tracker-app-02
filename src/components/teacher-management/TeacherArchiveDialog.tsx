import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Archive, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeacherArchiveDialogProps {
  teacher: {
    id: string;
    name: string;
    status: 'active' | 'archived';
  };
  isOpen: boolean;
  onClose: () => void;
  onArchive: (teacherId: string, reason?: string) => Promise<boolean>;
  onRestore: (teacherId: string) => Promise<boolean>;
}

const TeacherArchiveDialog = ({ 
  teacher, 
  isOpen, 
  onClose, 
  onArchive, 
  onRestore 
}: TeacherArchiveDialogProps) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleArchive = async () => {
    setIsLoading(true);
    const success = await onArchive(teacher.id, reason);
    
    if (success) {
      toast({
        title: "Teacher Archived",
        description: `${teacher.name} has been archived successfully.`,
      });
      onClose();
      setReason("");
    } else {
      toast({
        title: "Error",
        description: "Failed to archive teacher. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    const success = await onRestore(teacher.id);
    
    if (success) {
      toast({
        title: "Teacher Restored",
        description: `${teacher.name} has been restored successfully.`,
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: "Failed to restore teacher. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const isArchived = teacher.status === 'archived';

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isArchived ? (
              <>
                <RotateCcw className="h-5 w-5 text-green-600" />
                Restore Teacher
              </>
            ) : (
              <>
                <Archive className="h-5 w-5 text-orange-600" />
                Archive Teacher
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived ? (
              <>
                Are you sure you want to restore <strong>{teacher.name}</strong>? 
                This will reactivate their account and they will appear in active teacher lists.
              </>
            ) : (
              <>
                Are you sure you want to archive <strong>{teacher.name}</strong>? 
                This will hide them from the default teacher list but preserve all their data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isArchived && (
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for archiving (optional)
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Left the school, Transferred to another department..."
              maxLength={200}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          {isArchived ? (
            <AlertDialogAction
              onClick={handleRestore}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isLoading ? "Restoring..." : "Restore Teacher"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              {isLoading ? "Archiving..." : "Archive Teacher"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TeacherArchiveDialog;