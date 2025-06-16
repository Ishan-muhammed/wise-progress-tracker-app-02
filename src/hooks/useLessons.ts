
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { mergeProfiles, fetchLessonProfiles } from '@/utils/lessonUtils';

export const useLessons = (dateFilter?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  
  // Use refs to track current values without causing re-renders
  const currentDateFilter = useRef(dateFilter);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);

  // Update ref when dateFilter changes
  useEffect(() => {
    currentDateFilter.current = dateFilter;
  }, [dateFilter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchLessons = useCallback(async () => {
    // Don't fetch if component is unmounted
    if (isUnmountedRef.current || !user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('lessons')
        .select('*')
        .order('date', { ascending: false });

      if (currentDateFilter.current) {
        query = query.eq('date', currentDateFilter.current);
      }

      const { data: lessonsData, error: lessonsError } = await query;

      if (signal.aborted || isUnmountedRef.current) return;

      if (lessonsError) {
        setError('Failed to fetch lessons');
        setLessons([]);
        return;
      }

      if (!lessonsData || lessonsData.length === 0) {
        setLessons([]);
        return;
      }

      // Get unique user_ids and ensure they're strings
      const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];

      // Fetch profiles for all lesson user_ids
      const profileMap = await fetchLessonProfiles(userIds, signal);

      if (signal.aborted || isUnmountedRef.current || !profileMap) return;

      // Merge teacher name into each lesson
      const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
      
      if (!isUnmountedRef.current) {
        setLessons(merged);
      }

    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError") && !isUnmountedRef.current) {
        console.error('Unexpected error fetching lessons:', err);
        setError('An unexpected error occurred');
        setLessons([]);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, isAdmin]); // Removed dateFilter from dependencies to prevent infinite loops

  // Effect to trigger fetch when dependencies change
  useEffect(() => {
    if (user) {
      fetchLessons();
    } else {
      setLessons([]);
      setLoading(false);
    }
  }, [fetchLessons, dateFilter]); // dateFilter here is safe since fetchLessons doesn't depend on it

  return { lessons, loading, error, refetch: fetchLessons };
};
