
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom"; // Add navigation

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
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

    // Show loading max 7s, then force to not-loading & potentially redirect
    loadingTimeout = setTimeout(() => {
      if (!cancelled && loading) {
        setLoading(false);
        if (!user && !session) {
          console.warn("[AuthContext] Timeout expired, redirecting to /auth due to no session/user.");
          navigate('/auth');
        }
      }
    }, 7000);

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const userRoles = await fetchUserRoles(session.user.id);
          if (!cancelled) setRoles(userRoles);
        } else {
          setRoles([]);
        }
        setLoading(false);
      }
    );

    // Get session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userRoles = await fetchUserRoles(session.user.id);
        if (!cancelled) setRoles(userRoles);
      }
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) setLoading(false);
      console.error("[AuthContext] Error getting session:", e);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
    // only run on mount
    // eslint-disable-next-line
  }, []);

  // When loading finishes, but still no session/user, redirect to /auth
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

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

