
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
  logout: () => Promise<void>;
  isExplicitLogin: boolean;
  setExplicitLogin: (value: boolean) => void;
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
  logout: async () => {},
  isExplicitLogin: false,
  setExplicitLogin: () => {},
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
    isUnmountedRef, isExplicitLogin, setIsExplicitLogin
  } = useAuthState();

  const { fetchUserRoles } = useAuthRoles(isUnmountedRef);

  const logout = useCallback(async () => {
    console.log('Logging out user');
    setIsExplicitLogin(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  }, [setIsExplicitLogin]);

  const setExplicitLogin = useCallback((value: boolean) => {
    console.log('Setting explicit login:', value);
    setIsExplicitLogin(value);
  }, [setIsExplicitLogin]);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (isUnmountedRef.current) return;

    console.log('Auth state change:', event, session?.user?.id || 'No session');
    
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      console.log('User authenticated, fetching roles...');
      
      // Set explicit login flag for SIGNED_IN events (not for initial session restoration)
      if (event === 'SIGNED_IN') {
        console.log('Setting explicit login to true for SIGNED_IN event');
        setIsExplicitLogin(true);
      }
      
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
          setRoles([]);
          setLoading(false);
        }
      }
    } else {
      if (!isUnmountedRef.current) {
        setRoles([]);
        setLoading(false);
        setIsExplicitLogin(false);
      }
    }
  }, [fetchUserRoles, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef, setIsExplicitLogin]);

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Initial session error:', error);
        if (!isUnmountedRef.current) {
          setError('Authentication service unavailable. Please try signing in.');
          setLoading(false);
        }
      } else {
        // Don't set explicit login for initial session restoration
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
    retry,
    logout,
    isExplicitLogin,
    setExplicitLogin
  }), [user, session, loading, roles, hasRole, isAdmin, error, retry, logout, isExplicitLogin, setExplicitLogin]);

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
