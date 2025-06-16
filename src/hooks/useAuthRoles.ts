
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthRoles = (isUnmountedRef: React.RefObject<boolean>) => {
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    console.log('Fetching roles for user:', userId);
    
    try {
      // Test the connection first
      const { data: testData, error: testError } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Database connection test passed');

      // Now fetch the actual roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log('Role query result - Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching user roles:', error);
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
