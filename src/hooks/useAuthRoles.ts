
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthRoles = (isUnmountedRef: React.RefObject<boolean>) => {
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(r => r.role as UserRole) || [];
    } catch (error) {
      console.error('Exception fetching user roles:', error);
      return [];
    }
  }, [isUnmountedRef]);

  return { fetchUserRoles };
};
