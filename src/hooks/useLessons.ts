
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

// Helper to merge teacher name into lessons
function mergeProfiles(lessons: Lesson[], profiles: Record<string, { name?: string }>): Lesson[] {
  return lessons.map(lesson => {
    const teacherName = profiles[lesson.user_id]?.name || "Unknown Teacher";
    return {
      ...lesson,
      profiles: {
        name: teacherName
      }
    };
  });
}

export const useLessons = (dateFilter?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchLessons = useCallback(async (signal?: AbortSignal) => {
    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('lessons')
        .select('*')
        .order('date', { ascending: false });

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      const { data: lessonsData, error: lessonsError } = await query;

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

      // Fetch profiles for all lesson user_ids in one go
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (signal?.aborted) return;

      if (profilesError) {
        console.error('Error fetching profile names:', profilesError);
      }

      const profileMap: Record<string, { name?: string }> = {};
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          const profileId = String(profile.id);
          profileMap[profileId] = { name: profile.name };
        });
      }

      // Merge teacher name into each lesson
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
  }, [dateFilter, user?.id, isAdmin]);

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

  return { lessons, loading, error, refetch: fetchLessons };
};

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
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (signal?.aborted) return;

      if (profilesError) {
        console.error('Error fetching profile names:', profilesError);
      }

      const profileMap: Record<string, { name?: string }> = {};
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          const profileId = String(profile.id);
          profileMap[profileId] = { name: profile.name };
        });
      }

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
