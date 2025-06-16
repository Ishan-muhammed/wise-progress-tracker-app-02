
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

// Move AuthProvider to its own named function for useNavigate
const AuthProviderImpl = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const navigate = useNavigate();
  
  // Use refs to prevent unnecessary re-renders and track state
  const isUnmountedRef = useRef(false);
  const rolesCache = useRef<Record<string, UserRole[]>>({});
  const lastUserIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Fetch user roles from database with caching
  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (isUnmountedRef.current) return [];
    
    // Check cache first
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
      
      // Cache the result
      rolesCache.current[userId] = userRoles;
      
      return userRoles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }, []);

  // Stable navigation function
  const navigateToAppropriate = useCallback((userRoles: UserRole[], event: string) => {
    if (event !== 'SIGNED_IN') return;
    
    const currentPath = window.location.pathname;
    if (currentPath === '/auth' || currentPath === '/') {
      if (userRoles.includes('admin')) {
        navigate('/admin-dashboard');
      } else if (userRoles.includes('teacher')) {
        navigate('/teacher-dashboard');
      }
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    // Get initial session first
    const initializeAuth = async () => {
      if (cancelled || isUnmountedRef.current) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (cancelled || isUnmountedRef.current) return;
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.user.id !== lastUserIdRef.current) {
          lastUserIdRef.current = session.user.id;
          const userRoles = await fetchUserRoles(session.user.id);
          if (!cancelled && !isUnmountedRef.current) {
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

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled || isUnmountedRef.current) return;

        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch roles if user changed
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
            // Only redirect to auth if user explicitly signed out
            if (event === 'SIGNED_OUT') {
              navigate('/auth');
            }
          }
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchUserRoles, navigateToAppropriate]);

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);
  const isAdmin = useCallback(() => roles.includes('admin'), [roles]);

  // Memoize context value to prevent unnecessary re-renders
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

// HOC to provide useNavigate
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <AuthProviderImpl>{children}</AuthProviderImpl>
    </React.Suspense>
  );
};
