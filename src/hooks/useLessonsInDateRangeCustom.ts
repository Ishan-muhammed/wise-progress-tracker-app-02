
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { format } from 'date-fns';

export const useLessonsInDateRangeCustom = (startDate: Date, endDate: Date) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const fetchLessons = useCallback(async () => {
    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      console.log(`Fetching lessons for date range: ${startStr} to ${endStr}`);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setError('Failed to fetch lessons');
        return;
      }

      console.log(`Found ${lessonsData?.length || 0} lessons in date range`);
      
      const transformedLessons: Lesson[] = (lessonsData || []).map(lesson => ({
        ...lesson,
        profiles: undefined
      }));
      
      setLessons(transformedLessons);

    } catch (err) {
      console.error('Unexpected error fetching lessons:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { 
    lessons, 
    loading, 
    error,
    refetch: fetchLessons
  };
};
