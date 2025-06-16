
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

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (isUnmountedRef.current) return;

    console.log('Auth state change:', event, session?.user?.id || 'No session');
    
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      console.log('Fetching user roles for:', session.user.id);
      
      // Direct role check with immediate retry on failure
      try {
        const userRoles = await fetchUserRoles(session.user.id);
        console.log('Successfully fetched roles:', userRoles);
        
        if (!isUnmountedRef.current) {
          setRoles(userRoles);
          
          // Navigate immediately after setting roles
          if (userRoles.length > 0) {
            console.log('Triggering navigation with roles:', userRoles);
            navigateToAppropriate(userRoles);
          } else {
            console.log('No roles found, showing error');
            setError('No user roles found. Please contact an administrator.');
          }
        }
      } catch (error) {
        console.error('Role fetch error:', error);
        if (!isUnmountedRef.current) {
          setError('Failed to load user permissions. Please try signing in again.');
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
  }, [fetchUserRoles, navigateToAppropriate, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef]);

  const retry = useCallback(() => {
    console.log('Retrying authentication');
    setError(null);
    setLoading(true);
    
    // Clear session and force re-authentication
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
    
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
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

    // Reduced timeout to 8 seconds with better error handling
    const timeoutId = setTimeout(() => {
      if (!isUnmountedRef.current && loading) {
        console.log('Authentication timeout after 8 seconds');
        setError('Authentication timeout. Please sign in.');
        setLoading(false);
      }
    }, 8000);

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once

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
