
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  name: string;
  description: string;
}

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        console.log('Starting to fetch subjects...'); // DEBUG
        setLoading(true);
        
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        console.log('Supabase response:', { data, error }); // DEBUG

        if (error) {
          setError(error.message);
          console.error('Error fetching subjects:', error);
          setSubjects([]);
        } else {
          setSubjects(data || []);
          setError(null);
          console.log('Successfully fetched subjects:', data); // DEBUG
        }
      } catch (err) {
        setError('Failed to fetch subjects');
        console.error('Catch block - Error fetching subjects:', err);
        setSubjects([]);
      } finally {
        setLoading(false);
        console.log('Finished fetching subjects, loading set to false'); // DEBUG
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, loading, error };
};
