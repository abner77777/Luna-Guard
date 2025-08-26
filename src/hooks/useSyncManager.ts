import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncManagerOptions {
  onSync: () => Promise<void>;
  interval?: number; // in milliseconds, default 1 hour
  enablePullToRefresh?: boolean;
}

export function useSyncManager({ 
  onSync, 
  interval = 60 * 60 * 1000, // 1 hour default
  enablePullToRefresh = true 
}: SyncManagerOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pullStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const { toast } = useToast();

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onSync();
      setLastSyncTime(new Date());
      // Silent sync - no toast notification to avoid interrupting user experience
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Error de sincronización",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onSync, isRefreshing, toast]);

  // Setup automatic sync interval
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (!isRefreshing) {
        manualSync();
      }
    }, interval);

    // Initial sync
    if (!lastSyncTime) {
      manualSync();
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, manualSync]);

  // Pull-to-refresh functionality
  useEffect(() => {
    if (!enablePullToRefresh) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        pullStartY.current = e.touches[0].clientY;
        isPulling.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        const currentY = e.touches[0].clientY;
        const pullDistance = currentY - pullStartY.current;
        
        if (pullDistance > 80) { // 80px threshold
          isPulling.current = true;
          // Visual feedback could be added here
        }
      }
    };

    const handleTouchEnd = () => {
      if (isPulling.current && !isRefreshing) {
        manualSync();
      }
      isPulling.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, manualSync, isRefreshing]);

  // Get time since last sync
  const getTimeSinceLastSync = useCallback(() => {
    if (!lastSyncTime) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `Hace ${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `Hace ${minutes}m`;
    } else {
      return 'Hace unos segundos';
    }
  }, [lastSyncTime]);

  return {
    isRefreshing,
    lastSyncTime,
    manualSync,
    getTimeSinceLastSync,
  };
}