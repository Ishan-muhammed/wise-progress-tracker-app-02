
import { useState, useCallback, useRef, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExplicitLogin, setIsExplicitLogin] = useState(false);
  
  const isUnmountedRef = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rolesFetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);
  const isAdmin = useCallback(() => roles.includes('admin'), [roles]);

  const setUserWithValidation = useCallback((newUser: User | null) => {
    if (isUnmountedRef.current) return;
    
    // Clear role cache when user changes
    if (newUser?.id !== user?.id) {
      rolesFetchedRef.current.clear();
      setRoles([]);
    }
    
    setUser(newUser);
  }, [user?.id]);

  const setSessionWithValidation = useCallback((newSession: Session | null) => {
    if (isUnmountedRef.current) return;
    
    // Validate session before setting
    if (newSession) {
      const now = Date.now() / 1000;
      const expiresAt = newSession.expires_at || 0;
      
      if (expiresAt > now) {
        console.log('Setting valid session, expires at:', new Date(expiresAt * 1000));
        setSession(newSession);
      } else {
        console.log('Session expired, not setting');
        setSession(null);
        setError('Session expired. Please sign in again.');
      }
    } else {
      setSession(newSession);
    }
  }, []);

  const setRolesWithCache = useCallback((newRoles: UserRole[], userId?: string) => {
    if (isUnmountedRef.current) return;
    
    if (userId) {
      rolesFetchedRef.current.add(userId);
    }
    
    setRoles(newRoles);
  }, []);

  const hasRolesFetched = useCallback((userId: string) => {
    return rolesFetchedRef.current.has(userId);
  }, []);

  return {
    user,
    setUser: setUserWithValidation,
    session,
    setSession: setSessionWithValidation,
    loading,
    setLoading,
    roles,
    setRoles: setRolesWithCache,
    error,
    setError,
    hasRole,
    isAdmin,
    isUnmountedRef,
    initTimeoutRef,
    isExplicitLogin,
    setIsExplicitLogin,
    hasRolesFetched
  };
};
