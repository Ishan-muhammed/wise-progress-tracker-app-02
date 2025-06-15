
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
  console.log('=== MERGE PROFILES DEBUG ===');
  console.log('Lessons to merge:', lessons.length);
  console.log('Profile map keys:', Object.keys(profiles));
  console.log('Profile map values:', profiles);
  
  return lessons.map(lesson => {
    console.log(`Processing lesson ID: ${lesson.id}, user_id: ${lesson.user_id}`);
    console.log(`Looking for profile with key: ${lesson.user_id}`);
    console.log(`Found profile:`, profiles[lesson.user_id]);
    
    const teacherName = profiles[lesson.user_id]?.name || "Unknown Teacher";
    console.log(`Final teacher name for lesson ${lesson.id}: ${teacherName}`);
    
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

      console.log('=== LESSONS FETCH DEBUG ===');
      console.log('Raw lessons data:', lessonsData);

      // Get unique user_ids and ensure they're strings
      const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];
      console.log('Unique user IDs from lessons:', userIds);
      console.log('User ID types:', userIds.map(id => ({ id, type: typeof id })));

      // Fetch profiles for all lesson user_ids in one go
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profile names:', profilesError);
      }

      console.log('=== PROFILES FETCH DEBUG ===');
      console.log('Raw profiles data:', profilesData);

      const profileMap: Record<string, { name?: string }> = {};
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          const profileId = String(profile.id); // Ensure consistent string type
          profileMap[profileId] = { name: profile.name };
          console.log(`Profile mapping: ${profileId} -> ${profile.name}`);
        });
      }

      console.log('Final profile map:', profileMap);

      // Merge teacher name into each lesson
      const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
      console.log('Final merged lessons:', merged.map(l => ({ id: l.id, user_id: l.user_id, teacher: l.profiles?.name })));
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

        console.log('=== DATE RANGE LESSONS FETCH DEBUG ===');
        console.log('Raw lessons data (date range):', lessonsData);

        // Get unique user_ids and ensure they're strings
        const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];
        console.log('Unique user IDs from lessons (date range):', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profile names:', profilesError);
        }

        console.log('=== PROFILES FETCH DEBUG (DATE RANGE) ===');
        console.log('Raw profiles data (date range):', profilesData);

        const profileMap: Record<string, { name?: string }> = {};
        if (profilesData) {
          profilesData.forEach((profile: any) => {
            const profileId = String(profile.id); // Ensure consistent string type
            profileMap[profileId] = { name: profile.name };
            console.log(`Profile mapping (date range): ${profileId} -> ${profile.name}`);
          });
        }

        console.log('Final profile map (date range):', profileMap);

        const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
        console.log('Final merged lessons (date range):', merged.map(l => ({ id: l.id, user_id: l.user_id, teacher: l.profiles?.name })));
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
