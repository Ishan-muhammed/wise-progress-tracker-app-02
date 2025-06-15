
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Add 'profiles' as an optional property for teacher name
export interface Lesson {
  id: string;
  user_id: string;
  class: string;
  subject: string;
  lesson_number: string;
  date: string;
  completed: boolean;
  assessment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    name?: string;
  };
}

// Fix fetchLessons for single date
export const useLessons = (dateFilter?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('lessons')
        .select(`
          *,
          profiles(name)
        `)
        .order('date', { ascending: false });

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to fetch lessons');
        setLessons([]);
        return;
      }

      // 'profiles' property may be null if join fails
      setLessons(data || []);
    } catch (err) {
      console.error('Unexpected error fetching lessons:', err);
      setError('An unexpected error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  return { lessons, loading, error, refetch: fetchLessons };
};

export const useLessonsInDateRange = (startDate: string, endDate: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('lessons')
          .select(`
            *,
            profiles(name)
          `)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching lessons in date range:', error);
          setError('Failed to fetch lessons');
          setLessons([]);
          return;
        }

        setLessons(data || []);
      } catch (err) {
        console.error('Unexpected error fetching lessons:', err);
        setError('An unexpected error occurred');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchLessons();
    }
  }, [startDate, endDate]);

  return { lessons, loading, error };
};
