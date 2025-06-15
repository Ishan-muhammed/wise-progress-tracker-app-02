
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MigrationUtility = () => {
  const [migrating, setMigrating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();

  // Only show to admins
  if (!hasRole('admin')) {
    return null;
  }

  const migrateLocalStorageData = async () => {
    setMigrating(true);
    
    try {
      // Get localStorage data
      const localData = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
      
      if (localData.length === 0) {
        toast({
          title: "No Data Found",
          description: "No localStorage data found to migrate.",
        });
        setMigrating(false);
        return;
      }

      console.log("Migrating", localData.length, "lessons from localStorage to Supabase");

      let migratedCount = 0;
      let errorCount = 0;

      // Process each lesson
      for (const lesson of localData) {
        try {
          // Map localStorage format to Supabase format
          const lessonData = {
            user_id: lesson.teacherId,
            class: lesson.class,
            subject: lesson.subject,
            lesson_number: lesson.lessonNumber,
            date: lesson.date,
            completed: lesson.completed || false,
            assessment: lesson.assessment || null
          };

          const { error } = await supabase
            .from('lessons')
            .insert(lessonData)
            .select()
            .single();

          if (error) {
            console.error('Error migrating lesson:', lesson.id, error);
            errorCount++;
          } else {
            migratedCount++;
          }
        } catch (err) {
          console.error('Unexpected error migrating lesson:', lesson.id, err);
          errorCount++;
        }
      }

      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${migratedCount} lessons. ${errorCount > 0 ? `${errorCount} errors occurred.` : ''}`,
      });

      console.log(`Migration completed: ${migratedCount} success, ${errorCount} errors`);

    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration Failed",
        description: "An error occurred during migration. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const clearLocalStorageData = async () => {
    setClearing(true);
    
    try {
      const localData = JSON.parse(localStorage.getItem("lessonCompletions") || "[]");
      
      if (localData.length === 0) {
        toast({
          title: "No Data Found",
          description: "No localStorage data found to clear.",
        });
        setClearing(false);
        return;
      }

      localStorage.removeItem("lessonCompletions");
      
      toast({
        title: "Data Cleared",
        description: `Cleared ${localData.length} lessons from localStorage.`,
      });

      console.log("Cleared localStorage lesson data");

    } catch (error) {
      console.error('Error clearing localStorage:', error);
      toast({
        title: "Clear Failed",
        description: "An error occurred while clearing localStorage.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Data Migration Utility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Migration Process</h3>
          <p className="text-blue-700 text-sm">
            This utility will migrate lesson data from localStorage to the Supabase database. 
            After successful migration, you can safely clear the localStorage data.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={migrateLocalStorageData} 
            disabled={migrating}
            className="flex-1"
          >
            {migrating ? "Migrating..." : "Migrate localStorage to Database"}
          </Button>
          
          <Button 
            onClick={clearLocalStorageData} 
            disabled={clearing}
            variant="outline"
            className="flex-1"
          >
            {clearing ? "Clearing..." : "Clear localStorage Data"}
          </Button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h3>
          <p className="text-yellow-700 text-sm">
            Only clear localStorage data after confirming the migration was successful 
            and all data is properly stored in the database.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationUtility;
