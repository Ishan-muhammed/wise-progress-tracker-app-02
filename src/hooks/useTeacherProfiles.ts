
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  age: number | null;
}

export const useTeacherProfiles = () => {
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchProfiles = useCallback(async () => {
    if (isUnmountedRef.current) return;

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);

      // Fetch all users who have the teacher role (including those who also have admin role)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email, 
          gender, 
          age,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'teacher');

      if (signal.aborted || isUnmountedRef.current) return;

      if (error) {
        console.error('Error fetching teacher profiles:', error);
      } else {
        // Transform the data to match our interface
        const teacherProfiles = data?.map((profile: any) => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          gender: profile.gender,
          age: profile.age
        })) || [];
        
        if (!isUnmountedRef.current) {
          setProfiles(teacherProfiles);
        }
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError") && !isUnmountedRef.current) {
        console.error('Error fetching teacher profiles:', error);
      }
    } finally {
      if (!isUnmountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getTeacherName = useCallback((teacherId: string) => {
    const teacher = profiles.find(p => p.id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  }, [profiles]);

  return { profiles, loading, getTeacherName };
};
