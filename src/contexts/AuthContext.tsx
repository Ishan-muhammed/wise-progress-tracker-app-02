
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
      
      // Retry logic for role fetching
      let retryCount = 0;
      const maxRetries = 3;
      
      const fetchRolesWithRetry = async (): Promise<UserRole[]> => {
        try {
          const userRoles = await fetchUserRoles(session.user.id);
          console.log('Successfully fetched roles:', userRoles);
          return userRoles;
        } catch (error) {
          console.error(`Role fetch attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying role fetch in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchRolesWithRetry();
          }
          throw error;
        }
      };

      try {
        const userRoles = await fetchRolesWithRetry();
        if (!isUnmountedRef.current) {
          console.log('Setting roles:', userRoles);
          setRoles(userRoles);
          
          // Navigate after roles are confirmed
          if (userRoles.length > 0) {
            console.log('Triggering navigation with roles:', userRoles);
            // Small delay to ensure state is updated
            setTimeout(() => {
              navigateToAppropriate(userRoles);
            }, 100);
          } else {
            setError('No user roles found. Please contact an administrator.');
          }
        }
      } catch (error) {
        console.error('Final error fetching roles:', error);
        if (!isUnmountedRef.current) {
          setError('Failed to load user permissions. Please try again.');
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
    
    // Re-check session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Retry session error:', error);
        setError('Failed to reconnect. Please refresh the page.');
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
          setError('Authentication service unavailable. Please try again.');
          setLoading(false);
        }
      } else {
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    // Increase timeout to 15 seconds and add better state checking
    const timeoutId = setTimeout(() => {
      if (!isUnmountedRef.current && loading) {
        console.log('Authentication timeout after 15 seconds - checking current state');
        console.log('Current state - User:', !!user, 'Roles:', roles.length);
        
        // If we have a user but no roles, that's the issue
        if (user && roles.length === 0) {
          setError('Failed to load user roles. Please try refreshing the page.');
        } else if (!user) {
          setError('Authentication timeout. Please refresh the page.');
        }
        setLoading(false);
      }
    }, 15000); // Increased to 15 seconds

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
