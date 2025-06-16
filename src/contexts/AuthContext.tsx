
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthRoles } from '@/hooks/useAuthRoles';

export type UserRole = 'teacher' | 'admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  error: string | null;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  hasRole: () => false,
  isAdmin: false,
  error: null,
  retry: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderImpl = ({ children }: { children: React.ReactNode }) => {
  const {
    user, setUser, session, setSession, loading, setLoading,
    roles, setRoles, error, setError, hasRole, isAdmin,
    isUnmountedRef
  } = useAuthState();

  const { fetchUserRoles } = useAuthRoles(isUnmountedRef);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (isUnmountedRef.current) return;

    console.log('Auth state change:', event, session?.user?.id || 'No session');
    
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      console.log('User authenticated, fetching roles...');
      
      try {
        const userRoles = await fetchUserRoles(session.user.id);
        console.log('Roles fetched successfully:', userRoles);
        
        if (!isUnmountedRef.current) {
          setRoles(userRoles);
          setLoading(false);
        }
      } catch (error) {
        console.error('Role fetch error:', error);
        if (!isUnmountedRef.current) {
          // Don't set error for role fetching issues, just use empty roles
          setRoles([]);
          setLoading(false);
        }
      }
    } else {
      if (!isUnmountedRef.current) {
        setRoles([]);
        setLoading(false);
      }
    }
  }, [fetchUserRoles, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef]);

  const retry = useCallback(() => {
    console.log('Retrying authentication');
    setError(null);
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Retry session error:', error);
        setError('Failed to reconnect. Please sign in again.');
        setLoading(false);
      } else {
        handleAuthStateChange('RETRY', session);
      }
    });
  }, [handleAuthStateChange, setError, setLoading]);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session without timeout
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Initial session error:', error);
        if (!isUnmountedRef.current) {
          setError('Authentication service unavailable. Please try signing in.');
          setLoading(false);
        }
      } else {
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, isUnmountedRef, setError, setLoading]);

  const contextValue = React.useMemo(() => ({
    user,
    session,
    loading,
    roles,
    hasRole,
    isAdmin: isAdmin(),
    error,
    retry
  }), [user, session, loading, roles, hasRole, isAdmin, error, retry]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <AuthProviderImpl>{children}</AuthProviderImpl>
    </React.Suspense>
  );
};
