
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
    isUnmountedRef, initTimeoutRef
  } = useAuthState();

  const { navigateToAppropriate, navigate } = useAuthNavigation(setError);
  const { fetchUserRoles } = useAuthRoles(isUnmountedRef);

  const initializeAuth = useCallback(async () => {
    console.log('Starting authentication initialization');
    setError(null);
    setLoading(true);

    try {
      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      // Reduced timeout to 5 seconds for faster feedback
      initTimeoutRef.current = setTimeout(() => {
        if (isUnmountedRef.current) return;
        console.log('Authentication timeout reached after 5 seconds');
        setError('Connection timeout. The authentication service may be temporarily unavailable.');
        setLoading(false);
      }, 5000);

      // Test connection with a shorter timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 4000)
      );

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (isUnmountedRef.current) return;
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(`Authentication failed: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      console.log('Session retrieved:', session?.user?.id || 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('Fetching user roles...');
        const userRoles = await fetchUserRoles(session.user.id);
        if (!isUnmountedRef.current) {
          setRoles(userRoles);
          navigateToAppropriate(userRoles);
        }
      } else {
        setRoles([]);
      }
      
      // Clear timeout on success
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      if (!isUnmountedRef.current) {
        setLoading(false);
        console.log('Authentication initialization complete');
      }
    } catch (e) {
      if (!isUnmountedRef.current) {
        console.error('Authentication error:', e);
        const errorMessage = e instanceof Error && e.message === 'Request timeout' 
          ? 'Connection timeout. Please check your internet connection and try again.'
          : 'Failed to connect to the authentication service. Please check your internet connection.';
        setError(errorMessage);
        setLoading(false);
      }
    }
  }, [fetchUserRoles, navigateToAppropriate, setError, setLoading, setSession, setUser, setRoles, isUnmountedRef, initTimeoutRef]);

  const retry = useCallback(() => {
    console.log('Retrying authentication');
    initializeAuth();
  }, [initializeAuth]);

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
            if (event === 'SIGNED_OUT') {
              navigate('/auth');
            }
          }
        }
        
        if (!isUnmountedRef.current) {
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserRoles, navigateToAppropriate, navigate, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef]);

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
