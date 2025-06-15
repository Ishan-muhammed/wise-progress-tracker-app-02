
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Fetch user roles from database
  const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(r => r.role as UserRole) || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;

        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRoles = await fetchUserRoles(session.user.id);
          if (!cancelled) {
            setRoles(userRoles);
            
            // Navigate based on user role after successful auth
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' || currentPath === '/') {
              if (userRoles.includes('admin')) {
                navigate('/admin-dashboard');
              } else if (userRoles.includes('teacher')) {
                navigate('/teacher-dashboard');
              }
            }
          }
        } else {
          setRoles([]);
          // Only redirect to auth if not already there and not on public pages
          const currentPath = window.location.pathname;
          if (currentPath !== '/auth' && currentPath !== '/') {
            navigate('/auth');
          }
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userRoles = await fetchUserRoles(session.user.id);
        if (!cancelled) {
          setRoles(userRoles);
        }
      }
      
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) {
        console.error("[AuthContext] Error getting session:", e);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = roles.includes('admin');

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, hasRole, isAdmin }}>
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
