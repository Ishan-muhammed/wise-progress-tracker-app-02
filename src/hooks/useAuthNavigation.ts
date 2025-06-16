
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthNavigation = (setError: (error: string | null) => void) => {
  const navigate = useNavigate();

  const navigateToAppropriate = useCallback((userRoles: UserRole[]) => {
    const currentPath = window.location.pathname;
    
    console.log('Navigation check - Current path:', currentPath, 'Roles:', userRoles);
    
    // Only navigate from auth-related pages or root
    if (currentPath === '/auth' || currentPath === '/' || currentPath === '/login') {
      if (userRoles.includes('admin')) {
        console.log('Navigating to admin dashboard');
        navigate('/admin-dashboard');
      } else if (userRoles.includes('teacher')) {
        console.log('Navigating to teacher dashboard');
        navigate('/teacher-dashboard');
      } else {
        console.log('No valid roles found');
        setError('No valid user roles found. Please contact an administrator.');
      }
    }
  }, [navigate, setError]);

  return { navigateToAppropriate, navigate };
};
