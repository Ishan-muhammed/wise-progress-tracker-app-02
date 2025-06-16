
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
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

  const { navigateToAppropriate } = useAuthNavigation(setError);
  const { fetchUserRoles } = useAuthRoles(isUnmountedRef);

  const initializeAuth = useCallback(async () => {
    if (isUnmountedRef.current) return;
    
    console.log('Initializing authentication...');
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (isUnmountedRef.current) return;
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Session check complete:', session?.user?.id || 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('Fetching user roles...');
        const userRoles = await fetchUserRoles(session.user.id);
        if (!isUnmountedRef.current) {
          setRoles(userRoles);
          console.log('User roles loaded:', userRoles);
          navigateToAppropriate(userRoles);
        }
      } else {
        setRoles([]);
      }
      
      if (!isUnmountedRef.current) {
        setLoading(false);
        console.log('Authentication initialization complete');
      }
    } catch (e) {
      if (!isUnmountedRef.current) {
        console.error('Authentication error:', e);
        setError('Failed to initialize authentication. Please try again.');
        setLoading(false);
      }
    }
  }, [fetchUserRoles, navigateToAppropriate, setError, setLoading, setSession, setUser, setRoles, isUnmountedRef]);

  const retry = useCallback(() => {
    console.log('Retrying authentication initialization');
    setLoading(true);
    initializeAuth();
  }, [initializeAuth, setLoading]);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isUnmountedRef.current) return;

        console.log('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          const userRoles = await fetchUserRoles(session.user.id);
          if (!isUnmountedRef.current) {
            setRoles(userRoles);
            if (event === 'SIGNED_IN') {
              navigateToAppropriate(userRoles);
            }
          }
        } else {
          if (!isUnmountedRef.current) {
            setRoles([]);
          }
        }
        
        if (!isUnmountedRef.current) {
          setLoading(false);
        }
      }
    );

    // Only initialize once
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserRoles, navigateToAppropriate, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef]);

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
