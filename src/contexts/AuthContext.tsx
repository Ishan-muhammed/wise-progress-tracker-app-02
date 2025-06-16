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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  hasRole: () => false,
  isAdmin: false,
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
  const navigate = useNavigate();
  
  const isUnmountedRef = useRef(false);
  const rolesCache = useRef<Record<string, UserRole[]>>({});
  const lastUserIdRef = useRef<string | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    if (rolesCache.current[userId]) {
      return rolesCache.current[userId];
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      const userRoles = data?.map(r => r.role as UserRole) || [];
      rolesCache.current[userId] = userRoles;
      return userRoles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }, []);

  const navigateToAppropriate = useCallback((userRoles: UserRole[], event: string) => {
    if (event !== 'SIGNED_IN') return;
    
    const currentPath = window.location.pathname;
    console.log('AuthContext: Navigating from:', currentPath, 'with roles:', userRoles);
    
    // Only navigate if we're on auth-related pages
    if (currentPath === '/auth' || currentPath === '/' || currentPath === '/login') {
      // Clear any existing navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Use timeout to prevent navigation conflicts
      navigationTimeoutRef.current = setTimeout(() => {
        if (userRoles.includes('admin')) {
          console.log('AuthContext: Navigating to admin dashboard');
          navigate('/admin-dashboard');
        } else if (userRoles.includes('teacher')) {
          console.log('AuthContext: Navigating to teacher dashboard');
          navigate('/teacher-dashboard');
        } else {
          console.log('AuthContext: No valid roles, staying on current page');
        }
      }, 100);
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      if (cancelled || isUnmountedRef.current) return;
      
      try {
        console.log('AuthContext: Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (cancelled || isUnmountedRef.current) return;
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('AuthContext: Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.user.id !== lastUserIdRef.current) {
          lastUserIdRef.current = session.user.id;
          const userRoles = await fetchUserRoles(session.user.id);
          if (!cancelled && !isUnmountedRef.current) {
            console.log('AuthContext: Setting roles:', userRoles);
            setRoles(userRoles);
          }
        } else if (!session?.user) {
          lastUserIdRef.current = null;
          setRoles([]);
        }
        
        if (!cancelled && !isUnmountedRef.current) {
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled && !isUnmountedRef.current) {
          console.error("[AuthContext] Error initializing auth:", e);
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled || isUnmountedRef.current) return;

        console.log('AuthContext: Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          if (session.user.id !== lastUserIdRef.current) {
            lastUserIdRef.current = session.user.id;
            const userRoles = await fetchUserRoles(session.user.id);
            if (!cancelled && !isUnmountedRef.current) {
              setRoles(userRoles);
              navigateToAppropriate(userRoles, event);
            }
          }
        } else {
          lastUserIdRef.current = null;
          if (!cancelled && !isUnmountedRef.current) {
            setRoles([]);
            if (event === 'SIGNED_OUT') {
              navigate('/auth');
            }
          }
        }
        
        // Ensure loading is set to false after auth state changes
        if (!cancelled && !isUnmountedRef.current) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles, navigateToAppropriate]);

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);
  const isAdmin = useCallback(() => roles.includes('admin'), [roles]);

  const contextValue = React.useMemo(() => ({
    user,
    session,
    loading,
    roles,
    hasRole,
    isAdmin: isAdmin()
  }), [user, session, loading, roles, hasRole, isAdmin]);

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
