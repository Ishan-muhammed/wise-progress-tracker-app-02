
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthRoles = (isUnmountedRef: React.RefObject<boolean>) => {
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    console.log('Fetching roles for user:', userId);
    
    try {
      // Direct query with better error handling
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Role query result - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching user roles:', error);
        // If it's a permission error, return empty array to trigger proper error handling
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          throw new Error('Permission denied: Unable to fetch user roles');
        }
        throw new Error(`Role fetch failed: ${error.message}`);
      }

      const roles = data?.map(r => r.role as UserRole) || [];
      console.log('Processed roles:', roles);
      
      return roles;
    } catch (error) {
      console.error('Exception fetching user roles:', error);
      throw error; // Re-throw to allow retry logic
    }
  }, [isUnmountedRef]);

  return { fetchUserRoles };
};
