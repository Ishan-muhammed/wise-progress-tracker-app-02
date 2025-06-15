
import { useState, useEffect } from 'react';
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
  console.log('=== MERGE PROFILES DEBUG ===');
  console.log('Lessons to merge:', lessons.length);
  console.log('Profile map keys:', Object.keys(profiles));
  
  return lessons.map(lesson => {
    const teacherName = profiles[lesson.user_id]?.name || "Unknown Teacher";
    console.log(`Lesson ${lesson.id}: user_id=${lesson.user_id}, teacher=${teacherName}`);
    
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

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== LESSONS FETCH DEBUG ===');
      console.log('Current user:', user?.id);
      console.log('Is admin:', isAdmin);
      console.log('Date filter:', dateFilter);

      if (!user) {
        console.log('No authenticated user, cannot fetch lessons');
        setLessons([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('lessons')
        .select('*')
        .order('date', { ascending: false });

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      // Note: We don't need to add user filtering here anymore because:
      // 1. Teachers will only see their own lessons due to RLS policies
      // 2. Admins will see all lessons due to the updated RLS policies
      console.log('Executing lessons query (RLS will handle filtering)...');
      const { data: lessonsData, error: lessonsError } = await query;

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        setError('Failed to fetch lessons');
        setLessons([]);
        return;
      }

      console.log('Raw lessons data from database:', lessonsData);
      console.log('Number of lessons fetched:', lessonsData?.length || 0);

      if (!lessonsData || lessonsData.length === 0) {
        console.log('No lessons found in database');
        setLessons([]);
        return;
      }

      // Get unique user_ids and ensure they're strings
      const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];
      console.log('Unique teacher user IDs in lessons:', userIds);

      // Fetch profiles for all lesson user_ids in one go
      console.log('Fetching teacher profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profile names:', profilesError);
      }

      console.log('Raw profiles data:', profilesData);

      const profileMap: Record<string, { name?: string }> = {};
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          const profileId = String(profile.id);
          profileMap[profileId] = { name: profile.name };
          console.log(`Profile mapping: ${profileId} -> ${profile.name}`);
        });
      }

      console.log('Final profile map:', profileMap);

      // Merge teacher name into each lesson
      const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
      console.log('Final merged lessons with teacher names:', merged.map(l => ({ 
        id: l.id, 
        user_id: l.user_id, 
        teacher: l.profiles?.name,
        date: l.date,
        subject: l.subject,
        class: l.class
      })));
      
      setLessons(merged);
      console.log('=== END LESSONS FETCH DEBUG ===');

    } catch (err) {
      console.error('Unexpected error fetching lessons:', err);
      setError('An unexpected error occurred');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLessons();
    } else {
      setLessons([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, user, isAdmin]);

  return { lessons, loading, error, refetch: fetchLessons };
};

export const useLessonsInDateRange = (startDate: string, endDate: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== DATE RANGE LESSONS FETCH DEBUG ===');
        console.log('Current user:', user?.id);
        console.log('Is admin:', isAdmin);
        console.log('Start date:', startDate);
        console.log('End date:', endDate);

        if (!user) {
          console.log('No authenticated user, cannot fetch lessons');
          setLessons([]);
          setLoading(false);
          return;
        }

        console.log('Executing date range query (RLS will handle filtering)...');
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

        console.log('Raw lessons data (date range):', lessonsData);
        console.log('Number of lessons in date range:', lessonsData?.length || 0);

        if (!lessonsData || lessonsData.length === 0) {
          console.log('No lessons found in date range');
          setLessons([]);
          return;
        }

        // Get unique user_ids and ensure they're strings
        const userIds = [...new Set(lessonsData.map((lesson: Lesson) => String(lesson.user_id)))];
        console.log('Unique teacher user IDs (date range):', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profile names:', profilesError);
        }

        console.log('Raw profiles data (date range):', profilesData);

        const profileMap: Record<string, { name?: string }> = {};
        if (profilesData) {
          profilesData.forEach((profile: any) => {
            const profileId = String(profile.id);
            profileMap[profileId] = { name: profile.name };
            console.log(`Profile mapping (date range): ${profileId} -> ${profile.name}`);
          });
        }

        const merged = mergeProfiles(lessonsData as Lesson[], profileMap);
        console.log('Final merged lessons (date range):', merged.map(l => ({ 
          id: l.id, 
          user_id: l.user_id, 
          teacher: l.profiles?.name,
          date: l.date 
        })));
        
        setLessons(merged);
        console.log('=== END DATE RANGE LESSONS FETCH DEBUG ===');

      } catch (err) {
        console.error('Unexpected error fetching lessons:', err);
        setError('An unexpected error occurred');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate && user) {
      fetchLessons();
    } else {
      setLessons([]);
      setLoading(false);
    }
  }, [startDate, endDate, user, isAdmin]);

  return { lessons, loading, error };
};
