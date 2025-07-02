
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  age: number | null;
  status: 'active' | 'archived';
  archived_at: string | null;
  archived_by: string | null;
  last_active_at: string | null;
}

export interface TeacherProfilesOptions {
  statusFilter?: 'active' | 'archived';
  academicYear?: string;
}

export const useTeacherProfiles = (options: TeacherProfilesOptions = {}) => {
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUnmountedRef = useRef(false);
  
  const { statusFilter = 'active', academicYear } = options;

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

      // Build query with status filtering
      let query = supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email, 
          gender, 
          age,
          status,
          archived_at,
          archived_by,
          last_active_at
        `)
        .in('id', teacherIds);

      // Apply status filter
      query = query.eq('status', statusFilter);

      const { data, error } = await query;

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
          age: profile.age,
          status: profile.status || 'active',
          archived_at: profile.archived_at,
          archived_by: profile.archived_by,
          last_active_at: profile.last_active_at
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
  }, [statusFilter, academicYear]);

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

  const archiveTeacher = useCallback(async (teacherId: string, reason?: string) => {
    try {
      const { data, error } = await supabase.rpc('archive_teacher', {
        teacher_id: teacherId,
        reason: reason || null
      });

      if (error) {
        console.error('Error archiving teacher:', error);
        return false;
      }

      // Refresh the profiles list
      await fetchProfiles();
      return data;
    } catch (error) {
      console.error('Error archiving teacher:', error);
      return false;
    }
  }, [fetchProfiles]);

  const restoreTeacher = useCallback(async (teacherId: string) => {
    try {
      const { data, error } = await supabase.rpc('restore_teacher', {
        teacher_id: teacherId
      });

      if (error) {
        console.error('Error restoring teacher:', error);
        return false;
      }

      // Refresh the profiles list
      await fetchProfiles();
      return data;
    } catch (error) {
      console.error('Error restoring teacher:', error);
      return false;
    }
  }, [fetchProfiles]);

  return { profiles, loading, error, getTeacherName, refetch, archiveTeacher, restoreTeacher };
};
