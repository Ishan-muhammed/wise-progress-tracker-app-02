
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  return lessons.map(lesson => ({
    ...lesson,
    profiles: {
      name: profiles[lesson.user_id]?.name || "Unknown Teacher"
    }
  }));
}

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
        .select('*')
        .order('date', { ascending: false });

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      const { data: lessonsData, error: lessonsError } = await query;

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setError('Failed to fetch lessons');
        setLessons([]);
        return;
      }

      if (!lessonsData || lessonsData.length === 0) {
        setLessons([]);
        return;
      }

      // Get unique user_ids
      const userIds = [...new Set(lessonsData.map((lesson: Lesson) => lesson.user_id))];
      console.log('DEBUG: User IDs from lessons:', userIds);

      // Fetch profiles for all lesson user_ids in one go
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profile names:', profilesError);
      }

      console.log('DEBUG: Profiles data:', profilesData);

      const profileMap: Record<string, { name?: string }> = {};
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          profileMap[profile.id] = { name: profile.name };
        });
      }

      console.log('DEBUG: Profile map:', profileMap);

      // Merge teacher name into each lesson
      const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
      console.log('DEBUG: Merged lessons with profiles:', merged);
      setLessons(merged);

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

        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (lessonsError) {
          console.error('Error fetching lessons in date range:', lessonsError);
          setError('Failed to fetch lessons');
          setLessons([]);
          return;
        }

        if (!lessonsData || lessonsData.length === 0) {
          setLessons([]);
          return;
        }

        const userIds = [...new Set(lessonsData.map((lesson: Lesson) => lesson.user_id))];
        console.log('DEBUG: User IDs from lessons (date range):', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profile names:', profilesError);
        }

        console.log('DEBUG: Profiles data (date range):', profilesData);

        const profileMap: Record<string, { name?: string }> = {};
        if (profilesData) {
          profilesData.forEach((profile: any) => {
            profileMap[profile.id] = { name: profile.name };
          });
        }

        console.log('DEBUG: Profile map (date range):', profileMap);

        const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
        console.log('DEBUG: Merged lessons with profiles (date range):', merged);
        setLessons(merged);

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
