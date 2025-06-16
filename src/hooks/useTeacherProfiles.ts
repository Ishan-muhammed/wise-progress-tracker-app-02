
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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);

      console.log('Fetching teacher profiles...');

      // First, get all teacher user IDs
      const { data: teacherRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (signal.aborted || isUnmountedRef.current) return;

      if (rolesError) {
        console.error('Error fetching teacher roles:', rolesError);
        setError(`Failed to fetch teacher roles: ${rolesError.message}`);
        return;
      }

      if (!teacherRoles || teacherRoles.length === 0) {
        console.log('No teachers found in user_roles table');
        setProfiles([]);
        return;
      }

      const teacherIds = teacherRoles.map(role => role.user_id);
      console.log('Found teacher IDs:', teacherIds);

      // Now get the profiles for these teachers
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email, 
          gender, 
          age
        `)
        .in('id', teacherIds);

      if (signal.aborted || isUnmountedRef.current) return;

      if (error) {
        console.error('Error fetching teacher profiles:', error);
        setError(`Failed to fetch teacher profiles: ${error.message}`);
      } else {
        console.log('Teacher profiles fetched successfully:', data);
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
        setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const refetch = useCallback(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, getTeacherName, refetch };
};
