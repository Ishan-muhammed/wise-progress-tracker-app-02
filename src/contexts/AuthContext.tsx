
import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react';
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
    isUnmountedRef, isExplicitLogin, setIsExplicitLogin, hasRolesFetched
  } = useAuthState();

  const { fetchUserRoles, clearRoleCache } = useAuthRoles(isUnmountedRef);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializationStarted = useRef(false);

  // Maximum time to wait for authentication initialization
  const AUTH_TIMEOUT = 15000; // 15 seconds

  const logout = useCallback(async () => {
    console.log('AuthContext: Logging out user');
    setIsExplicitLogin(false);
    clearRoleCache();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthContext: Logout error:', error);
    }
  }, [setIsExplicitLogin, clearRoleCache]);

  const setExplicitLogin = useCallback((value: boolean) => {
    console.log('AuthContext: Setting explicit login:', value);
    setIsExplicitLogin(value);
  }, [setIsExplicitLogin]);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (isUnmountedRef.current) {
      console.log('AuthContext: Component unmounted, skipping auth state change');
      return;
    }

    console.log('AuthContext: Auth state change:', event, session?.user?.id || 'No session');
    
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      console.log('AuthContext: User authenticated, checking roles...');
      
      // Set explicit login flag for SIGNED_IN events (not for initial session restoration)
      if (event === 'SIGNED_IN') {
        console.log('AuthContext: Setting explicit login to true for SIGNED_IN event');
        setIsExplicitLogin(true);
      }
      
      // Only fetch roles if we haven't already fetched them for this user
      if (!hasRolesFetched(session.user.id)) {
        try {
          console.log('AuthContext: Fetching roles for user:', session.user.id);
          const userRoles = await fetchUserRoles(session.user.id);
          console.log('AuthContext: Roles fetched successfully:', userRoles);
          
          if (!isUnmountedRef.current) {
            setRoles(userRoles, session.user.id);
            setLoading(false);
            
            // Clear auth timeout since we successfully loaded
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }
          }
        } catch (error) {
          console.error('AuthContext: Role fetch error:', error);
          if (!isUnmountedRef.current) {
            // Set empty roles and stop loading on error
            setRoles([], session.user.id);
            setLoading(false);
            
            // Clear auth timeout
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }
          }
        }
      } else {
        console.log('AuthContext: Roles already fetched for user:', session.user.id);
        setLoading(false);
        
        // Clear auth timeout
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
      }
    } else {
      if (!isUnmountedRef.current) {
        setRoles([]);
        setLoading(false);
        setIsExplicitLogin(false);
        
        // Clear auth timeout
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
      }
    }
  }, [fetchUserRoles, setSession, setUser, setError, setRoles, setLoading, isUnmountedRef, setIsExplicitLogin, hasRolesFetched]);

  const retry = useCallback(() => {
    console.log('AuthContext: Retrying authentication');
    setError(null);
    setLoading(true);
    
    // Set up timeout for retry
    authTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        console.error('AuthContext: Retry timeout reached');
        setError('Authentication timeout. Please try signing in again.');
        setLoading(false);
      }
    }, AUTH_TIMEOUT);
    
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthContext: Retry session error:', error);
        if (!isUnmountedRef.current) {
          setError('Failed to reconnect. Please sign in again.');
          setLoading(false);
          
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
        }
      } else {
        handleAuthStateChange('RETRY', session);
      }
    });
  }, [handleAuthStateChange, setError, setLoading, isUnmountedRef, AUTH_TIMEOUT]);

  useEffect(() => {
    if (initializationStarted.current) {
      console.log('AuthContext: Initialization already started, skipping');
      return;
    }
    
    initializationStarted.current = true;
    console.log('AuthContext: Setting up auth state listener');
    
    // Set up auth timeout
    authTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        console.error('AuthContext: Auth initialization timeout reached');
        setError('Authentication timeout. Please try signing in.');
        setLoading(false);
      }
    }, AUTH_TIMEOUT);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthContext: Initial session error:', error);
        if (!isUnmountedRef.current) {
          setError('Authentication service unavailable. Please try signing in.');
          setLoading(false);
          
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
        }
      } else {
        // Don't set explicit login for initial session restoration
        handleAuthStateChange('INITIAL_SESSION', session);
      }
    });

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
      
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    };
  }, [handleAuthStateChange, isUnmountedRef, setError, setLoading, AUTH_TIMEOUT]);

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
