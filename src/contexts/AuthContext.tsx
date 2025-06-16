
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    console.log('AuthContext: Fetching roles for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('AuthContext: Error fetching user roles:', error);
        return [];
      }

      const userRoles = data?.map(r => r.role as UserRole) || [];
      console.log('AuthContext: Fetched roles:', userRoles);
      return userRoles;
    } catch (error) {
      console.error('AuthContext: Exception fetching user roles:', error);
      return [];
    }
  }, []);

  const navigateToAppropriate = useCallback((userRoles: UserRole[]) => {
    const currentPath = window.location.pathname;
    console.log('AuthContext: Current path:', currentPath, 'User roles:', userRoles);
    
    // Only navigate from auth-related pages
    if (currentPath === '/auth' || currentPath === '/' || currentPath === '/login') {
      if (userRoles.includes('admin')) {
        console.log('AuthContext: Navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else if (userRoles.includes('teacher')) {
        console.log('AuthContext: Navigating to teacher dashboard');
        navigate('/teacher-dashboard');
      } else {
        console.log('AuthContext: No valid roles found');
        setError('No valid user roles found. Please contact an administrator.');
      }
    }
  }, [navigate]);

  const initializeAuth = useCallback(async () => {
    console.log('AuthContext: Starting authentication initialization');
    setError(null);
    setLoading(true);

    try {
      // Set a timeout to prevent infinite loading
      initTimeoutRef.current = setTimeout(() => {
        if (isUnmountedRef.current) return;
        console.log('AuthContext: Initialization timeout reached');
        setError('Authentication is taking too long. Please try refreshing the page.');
        setLoading(false);
      }, 10000); // 10 second timeout

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (isUnmountedRef.current) return;
      
      if (error) {
        console.error('AuthContext: Error getting session:', error);
        setError('Failed to connect to authentication service.');
        setLoading(false);
        return;
      }

      console.log('AuthContext: Session retrieved:', session?.user?.id || 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('AuthContext: User found, fetching roles');
        const userRoles = await fetchUserRoles(session.user.id);
        if (!isUnmountedRef.current) {
          setRoles(userRoles);
          navigateToAppropriate(userRoles);
        }
      } else {
        console.log('AuthContext: No user session found');
        setRoles([]);
      }
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      if (!isUnmountedRef.current) {
        setLoading(false);
        console.log('AuthContext: Initialization complete');
      }
    } catch (e) {
      if (!isUnmountedRef.current) {
        console.error('AuthContext: Exception during initialization:', e);
        setError('An unexpected error occurred during authentication.');
        setLoading(false);
      }
    }
  }, [fetchUserRoles, navigateToAppropriate]);

  const retry = useCallback(() => {
    console.log('AuthContext: Retrying authentication');
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isUnmountedRef.current) return;

        console.log('AuthContext: Auth state change:', event, session?.user?.id || 'No session');
        
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
      console.log('AuthContext: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserRoles, navigateToAppropriate, navigate]);

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);
  const isAdmin = useCallback(() => roles.includes('admin'), [roles]);

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
