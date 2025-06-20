
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  roles: string[];
  isAdmin: boolean;
  isExplicitLogin: boolean;
  setExplicitLogin: (value: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  roles: [],
  isAdmin: false,
  isExplicitLogin: false,
  setExplicitLogin: () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isExplicitLogin, setIsExplicitLogin] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    console.log('AuthContext: Starting logout process...');
    setLoading(true);
    
    try {
      // Clear all state first
      setUser(null);
      setSession(null);
      setRoles([]);
      setError(null);
      setIsExplicitLogin(false);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Logout error:', error);
        throw error;
      }
      
      console.log('AuthContext: Logout successful');
    } catch (error: any) {
      console.error('AuthContext: Logout failed:', error);
      setError(error.message || 'Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthContext: Session error:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (isMounted) {
          if (initialSession) {
            console.log('AuthContext: Initial session found:', !!initialSession.user);
            setSession(initialSession);
            setUser(initialSession.user);
          } else {
            console.log('AuthContext: No initial session found');
            setSession(null);
            setUser(null);
          }
        }
      } catch (error: any) {
        console.error('AuthContext: Initialization error:', error);
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, !!session?.user);
        
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          console.log('AuthContext: User signed out, clearing state');
          setSession(null);
          setUser(null);
          setRoles([]);
          setError(null);
          setIsExplicitLogin(false);
        } else if (session) {
          console.log('AuthContext: User session updated');
          setSession(session);
          setUser(session.user);
          setError(null);
        }

        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user roles when user changes
  useEffect(() => {
    let isMounted = true;

    const fetchUserRoles = async () => {
      if (!user) {
        if (isMounted) {
          setRoles([]);
        }
        return;
      }

      try {
        console.log('AuthContext: Fetching roles for user:', user.id);
        
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('AuthContext: Error fetching roles:', error);
          if (isMounted) {
            setError(error.message);
            setRoles([]);
          }
          return;
        }

        const rolesList = userRoles?.map(ur => ur.role) || [];
        console.log('AuthContext: User roles fetched:', rolesList);
        
        if (isMounted) {
          setRoles(rolesList);
        }
      } catch (error: any) {
        console.error('AuthContext: Error in fetchUserRoles:', error);
        if (isMounted) {
          setError(error.message);
          setRoles([]);
        }
      }
    };

    fetchUserRoles();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isAdmin = roles.includes('admin');

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    roles,
    isAdmin,
    isExplicitLogin,
    setExplicitLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
