
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DeleteAccountDialogProps {
  isCurrentUser?: boolean;
  userId?: string;
  userName?: string;
  onSuccess?: () => void;
}

const DeleteAccountDialog = ({ 
  isCurrentUser = false, 
  userId, 
  userName,
  onSuccess 
}: DeleteAccountDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    console.log('Starting account deletion for:', isCurrentUser ? 'current user' : userId);

    try {
      if (isCurrentUser) {
        // Self-deletion: delete profile and auth user
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', (await supabase.auth.getUser()).data.user?.id);

        if (profileError) {
          console.error('Error deleting profile:', profileError);
          throw new Error('Failed to delete profile');
        }

        // Sign out the user (this will also delete their auth record)
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error('Error signing out:', signOutError);
        }

        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted."
        });

        // Redirect will be handled by auth state change
        window.location.href = '/';
      } else {
        // Admin deletion: use the admin function
        if (!userId) {
          throw new Error('User ID is required for admin deletion');
        }

        const { data, error } = await supabase.rpc('admin_delete_user', {
          target_user_id: userId
        });

        if (error) {
          console.error('Error deleting user:', error);
          throw new Error(error.message || 'Failed to delete user account');
        }

        if (!data) {
          throw new Error('You do not have permission to delete this account');
        }

        toast({
          title: "Account Deleted",
          description: `${userName || 'User'}'s account has been successfully deleted.`
        });

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            {isCurrentUser ? (
              "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed."
            ) : (
              `Are you sure you want to delete ${userName || 'this user'}'s account? This action cannot be undone. All their data will be permanently removed.`
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
