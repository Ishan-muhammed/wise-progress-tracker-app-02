
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';

export const useAuthNavigation = (setError: (error: string | null) => void) => {
  const navigate = useNavigate();

  const navigateToAppropriate = useCallback((userRoles: UserRole[]) => {
    const currentPath = window.location.pathname;
    
    console.log('Navigation check - Current path:', currentPath, 'Roles:', userRoles);
    
    // Navigate from auth-related pages, root, or loading states
    const shouldNavigate = currentPath === '/auth' || 
                          currentPath === '/' || 
                          currentPath === '/login' ||
                          currentPath.includes('loading');
    
    if (shouldNavigate && userRoles.length > 0) {
      // Force navigation with timeout to prevent hanging
      const performNavigation = () => {
        if (userRoles.includes('admin')) {
          console.log('Navigating to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else if (userRoles.includes('teacher')) {
          console.log('Navigating to teacher dashboard');
          navigate('/teacher-dashboard', { replace: true });
        } else {
          console.log('No valid roles found');
          setError('No valid user roles found. Please contact an administrator.');
        }
      };

      // Execute navigation immediately and with a backup timeout
      performNavigation();
      
      // Backup navigation in case the first one fails
      setTimeout(() => {
        const stillOnWrongPage = window.location.pathname === '/' || 
                                window.location.pathname === '/auth' || 
                                window.location.pathname === '/login';
        if (stillOnWrongPage) {
          console.log('Backup navigation triggered');
          performNavigation();
        }
      }, 1000);
    } else if (userRoles.length === 0 && shouldNavigate) {
      console.log('No roles found, staying on current page');
    }
  }, [navigate, setError]);

  return { navigateToAppropriate, navigate };
};
