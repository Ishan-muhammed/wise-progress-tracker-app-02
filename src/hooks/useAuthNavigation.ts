
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
      console.log('Should navigate - executing navigation logic');
      
      const performNavigation = () => {
        try {
          if (userRoles.includes('admin')) {
            console.log('Navigating to admin dashboard');
            navigate('/admin-dashboard', { replace: true });
            return true;
          } else if (userRoles.includes('teacher')) {
            console.log('Navigating to teacher dashboard');
            navigate('/teacher-dashboard', { replace: true });
            return true;
          } else {
            console.log('No valid roles found for navigation');
            setError('No valid user roles found. Please contact an administrator.');
            return false;
          }
        } catch (error) {
          console.error('Navigation error:', error);
          return false;
        }
      };

      // Execute navigation immediately
      const navigationSuccess = performNavigation();
      
      // Backup navigation with increased delay if the first one fails
      if (!navigationSuccess) {
        setTimeout(() => {
          console.log('Backup navigation triggered due to failure');
          performNavigation();
        }, 2000);
      } else {
        // Double-check navigation actually worked
        setTimeout(() => {
          const stillOnWrongPage = window.location.pathname === '/' || 
                                  window.location.pathname === '/auth' || 
                                  window.location.pathname === '/login';
          if (stillOnWrongPage) {
            console.log('Navigation verification failed - trying backup navigation');
            performNavigation();
          } else {
            console.log('Navigation verification successful');
          }
        }, 1500);
      }
    } else if (userRoles.length === 0 && shouldNavigate) {
      console.log('No roles found, staying on current page');
    } else {
      console.log('Navigation not needed - current path:', currentPath);
    }
  }, [navigate, setError]);

  return { navigateToAppropriate, navigate };
};
