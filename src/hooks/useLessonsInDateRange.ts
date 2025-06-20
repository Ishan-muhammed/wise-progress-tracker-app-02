
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

type DateRangeType = 'week' | 'month' | 'year';

export const useLessonsInDateRange = (selectedDate: Date, rangeType: DateRangeType) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const getDateRange = useCallback((date: Date, type: DateRangeType) => {
    const options = { weekStartsOn: 1 as const }; // Monday as first day
    
    switch (type) {
      case 'week':
        return {
          start: startOfWeek(date, options),
          end: endOfWeek(date, options)
        };
      case 'month':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date)
        };
      case 'year':
        return {
          start: startOfYear(date),
          end: endOfYear(date)
        };
      default:
        return {
          start: startOfWeek(date, options),
          end: endOfWeek(date, options)
        };
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { start, end } = getDateRange(selectedDate, rangeType);
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');

      console.log(`Fetching lessons for ${rangeType} range: ${startStr} to ${endStr}`);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          *,
          profiles!lessons_user_id_fkey (
            name
          )
        `)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setError('Failed to fetch lessons');
        return;
      }

      console.log(`Found ${lessonsData?.length || 0} lessons in ${rangeType} range`);
      setLessons(lessonsData || []);

    } catch (err) {
      console.error('Unexpected error fetching lessons:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, rangeType, getDateRange]);

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
