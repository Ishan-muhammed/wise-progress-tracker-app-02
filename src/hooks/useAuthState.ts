
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

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    roles,
    setRoles,
    error,
    setError,
    hasRole,
    isAdmin,
    isUnmountedRef,
    initTimeoutRef,
    isExplicitLogin,
    setIsExplicitLogin
  };
};
