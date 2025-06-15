
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { mergeProfiles, fetchLessonProfiles } from '@/utils/lessonUtils';

export const useLessonsInDateRange = (startDate: string, endDate: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchLessons = useCallback(async (signal?: AbortSignal) => {
    if (!user || !startDate || !endDate) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (signal?.aborted) return;

      if (lessonsError) {
        setError('Failed to fetch lessons');
        setLessons([]);
        setLoading(false);
        return;
      }

      if (!lessonsData || lessonsData.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      // Get unique user_ids and ensure they're strings
      const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];
      
      // Fetch profiles for all lesson user_ids
      const profileMap = await fetchLessonProfiles(userIds, signal);

      if (signal?.aborted) return;
      if (!profileMap) return;

      const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
      setLessons(merged);

    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error('Unexpected error fetching lessons:', err);
        setError('An unexpected error occurred');
        setLessons([]);
      }
    } finally {
      if (signal?.aborted) return;
      setLoading(false);
    }
  }, [startDate, endDate, user?.id, isAdmin]);

  useEffect(() => {
    // Reset states immediately when dependencies change
    setLoading(true);
    setError(null);
    
    const abortController = new AbortController();
    fetchLessons(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchLessons]);

  return { lessons, loading, error };
};
