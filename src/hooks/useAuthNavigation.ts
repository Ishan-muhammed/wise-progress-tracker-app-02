
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthNavigation = (setError: (error: string | null) => void) => {
  const navigate = useNavigate();

  const navigateToAppropriate = useCallback((userRoles: UserRole[]) => {
    const currentPath = window.location.pathname;
    
    // Only navigate from auth-related pages
    if (currentPath === '/auth' || currentPath === '/' || currentPath === '/login') {
      if (userRoles.includes('admin')) {
        navigate('/admin-dashboard');
      } else if (userRoles.includes('teacher')) {
        navigate('/teacher-dashboard');
      } else {
        setError('No valid user roles found. Please contact an administrator.');
      }
    }
  }, [navigate, setError]);

  return { navigateToAppropriate, navigate };
};
