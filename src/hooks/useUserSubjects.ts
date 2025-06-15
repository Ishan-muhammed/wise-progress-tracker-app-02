
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSubject {
  id: string;
  subject_id: string;
  subject_name: string;
  subject_description: string;
}

export const useUserSubjects = () => {
  const { user } = useAuth();
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSubjects = async () => {
    if (!user) {
      setUserSubjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .select(`
          id,
          subject_id,
          subjects (
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
        console.error('Error fetching user subjects:', error);
      } else {
        const transformedData = data?.map((item: any) => ({
          id: item.id,
          subject_id: item.subject_id,
          subject_name: item.subjects.name,
          subject_description: item.subjects.description
        })) || [];
        setUserSubjects(transformedData);
      }
    } catch (err) {
      setError('Failed to fetch user subjects');
      console.error('Error fetching user subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSubjects();
  }, [user]);

  const addSubject = async (subjectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subjects')
        .insert({
          user_id: user.id,
          subject_id: subjectId
        });

      if (error) {
        console.error('Error adding subject:', error);
        return false;
      }

      await fetchUserSubjects();
      return true;
    } catch (err) {
      console.error('Error adding subject:', err);
      return false;
    }
  };

  const removeSubject = async (subjectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('user_id', user.id)
        .eq('subject_id', subjectId);

      if (error) {
        console.error('Error removing subject:', error);
        return false;
      }

      await fetchUserSubjects();
      return true;
    } catch (err) {
      console.error('Error removing subject:', err);
      return false;
    }
  };

  return { 
    userSubjects, 
    loading, 
    error, 
    addSubject, 
    removeSubject, 
    refetch: fetchUserSubjects 
  };
};
