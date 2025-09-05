import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

interface UseAutoLogoutOptions {
  enabled: boolean;
  timeoutSeconds: number;
}

export function useAutoLogout(options: UseAutoLogoutOptions = { enabled: true, timeoutSeconds: 5 }) {
  const { signOut, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { enabled, timeoutSeconds } = options;

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startLogoutTimer = () => {
    if (!enabled || !user) return;
    
    clearExistingTimeout();
    
    timeoutRef.current = setTimeout(() => {
      console.log('Auto-logout: Page was hidden for', timeoutSeconds, 'seconds');
      signOut();
    }, timeoutSeconds * 1000);
  };

  const handleVisibilityChange = () => {
    if (!enabled || !user) return;

    if (document.hidden) {
      // Page lost focus - start the logout timer
      console.log('Page lost focus - starting auto-logout timer');
      startLogoutTimer();
    } else {
      // Page gained focus - cancel the logout timer
      console.log('Page gained focus - canceling auto-logout timer');
      clearExistingTimeout();
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for window focus/blur events as backup
    window.addEventListener('blur', () => {
      if (!document.hidden) {
        // Window lost focus but page is still visible
        console.log('Window lost focus - starting auto-logout timer');
        startLogoutTimer();
      }
    });

    window.addEventListener('focus', () => {
      console.log('Window gained focus - canceling auto-logout timer');
      clearExistingTimeout();
    });

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', startLogoutTimer);
      window.removeEventListener('focus', clearExistingTimeout);
      clearExistingTimeout();
    };
  }, [enabled, user, timeoutSeconds]);

  // Clean up timeout when user logs out or component unmounts
  useEffect(() => {
    if (!user) {
      clearExistingTimeout();
    }
  }, [user]);

  return {
    clearTimer: clearExistingTimeout,
  };
}