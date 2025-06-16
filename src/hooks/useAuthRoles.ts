
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/contexts/AuthContext';

// Role cache to prevent duplicate requests
const roleCache = new Map<string, { roles: UserRole[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const activeRequests = new Map<string, Promise<UserRole[]>>();

export const useAuthRoles = (isUnmountedRef: React.RefObject<boolean>) => {
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    console.log('Fetching roles for user:', userId);

    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached roles:', cached.roles);
      return cached.roles;
    }

    // Check if there's already an active request for this user
    const existingRequest = activeRequests.get(userId);
    if (existingRequest) {
      console.log('Using existing role request for user:', userId);
      return existingRequest;
    }

    const fetchRolesWithRetry = async (attempt: number = 1): Promise<UserRole[]> => {
      try {
        console.log(`Role fetch attempt ${attempt} for user:`, userId);

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching user roles (attempt ${attempt}):`, error);
          
          // Retry on specific errors
          if (attempt < maxRetries && (
            error.message.includes('timeout') || 
            error.message.includes('connection') ||
            error.code === 'PGRST301'
          )) {
            console.log(`Retrying role fetch in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            return fetchRolesWithRetry(attempt + 1);
          }
          
          // Return empty array instead of throwing to prevent blocking
          return [];
        }

        const roles = data?.map(r => r.role as UserRole) || [];
        console.log('Roles fetched successfully:', roles);
        
        // Cache the result
        roleCache.set(userId, { roles, timestamp: Date.now() });
        retryCountRef.current = 0;
        
        return roles;
      } catch (error) {
        console.error(`Exception fetching user roles (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries) {
          console.log(`Retrying role fetch in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          return fetchRolesWithRetry(attempt + 1);
        }
        
        // Return empty array instead of throwing to prevent blocking
        return [];
      }
    };

    // Create and cache the promise
    const promise = fetchRolesWithRetry();
    activeRequests.set(userId, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up the active request
      activeRequests.delete(userId);
    }
  }, [isUnmountedRef, maxRetries]);

  const clearRoleCache = useCallback((userId?: string) => {
    if (userId) {
      roleCache.delete(userId);
      activeRequests.delete(userId);
    } else {
      roleCache.clear();
      activeRequests.clear();
    }
  }, []);

  return { fetchUserRoles, clearRoleCache };
};
