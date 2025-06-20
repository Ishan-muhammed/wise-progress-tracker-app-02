
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserClass {
  id: string;
  user_id: string;
  class: string;
  created_at: string;
}

export const useUserClasses = () => {
  const [userClasses, setUserClasses] = useState<UserClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserClasses = async () => {
    if (!user) {
      setUserClasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_classes')
        .select('*')
        .eq('user_id', user.id)
        .order('class');

      if (error) throw error;
      setUserClasses(data || []);
    } catch (err) {
      console.error('Error fetching user classes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const addUserClass = async (className: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_classes')
        .insert({
          user_id: user.id,
          class: className
        });

      if (error) throw error;
      await fetchUserClasses();
      return true;
    } catch (err) {
      console.error('Error adding class:', err);
      setError(err instanceof Error ? err.message : 'Failed to add class');
      return false;
    }
  };

  const removeUserClass = async (className: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_classes')
        .delete()
        .eq('user_id', user.id)
        .eq('class', className);

      if (error) throw error;
      await fetchUserClasses();
      return true;
    } catch (err) {
      console.error('Error removing class:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove class');
      return false;
    }
  };

  useEffect(() => {
    fetchUserClasses();
  }, [user]);

  return {
    userClasses,
    loading,
    error,
    addUserClass,
    removeUserClass,
    refetch: fetchUserClasses
  };
};
