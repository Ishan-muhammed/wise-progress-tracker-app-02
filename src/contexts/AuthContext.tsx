
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('=== FETCHING USER ROLES DEBUG ===');
      console.log('Fetching roles for user ID:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      const userRoles = data?.map(r => r.role as UserRole) || [];
      console.log('Fetched user roles:', userRoles);
      console.log('=== END USER ROLES DEBUG ===');
      
      return userRoles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE DEBUG ===');
        console.log('Auth state change event:', event);
        console.log('Session:', session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRoles = await fetchUserRoles(session.user.id);
          setRoles(userRoles);
          console.log('User roles set in context:', userRoles);
        } else {
          setRoles([]);
          console.log('No user, roles cleared');
        }
        
        console.log('=== END AUTH STATE CHANGE DEBUG ===');
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('=== INITIAL SESSION DEBUG ===');
      console.log('Initial session:', session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userRoles = await fetchUserRoles(session.user.id);
        setRoles(userRoles);
        console.log('Initial user roles:', userRoles);
      }
      
      console.log('=== END INITIAL SESSION DEBUG ===');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = roles.includes('admin');

  console.log('=== AUTH CONTEXT CURRENT STATE ===');
  console.log('Current user:', user?.id);
  console.log('Current roles:', roles);
  console.log('Is admin:', isAdmin);
  console.log('=== END AUTH CONTEXT STATE ===');

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
