
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthRoles = (isUnmountedRef: React.RefObject<boolean>) => {
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    console.log('Fetching roles for user:', userId);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Role fetch timeout')), 10000)
      );

      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('Role query result - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching user roles:', error);
        // Return empty array instead of throwing for better UX
        return [];
      }

      const roles = data?.map(r => r.role as UserRole) || [];
      console.log('Processed roles:', roles);
      
      return roles;
    } catch (error) {
      console.error('Exception fetching user roles:', error);
      // Return empty array instead of throwing to prevent blocking
      return [];
    }
  }, [isUnmountedRef]);

  return { fetchUserRoles };
};
