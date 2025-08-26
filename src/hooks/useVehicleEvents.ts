import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface VehicleEvent {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  event_type: string;
  event_message: string;
  severity: 'low' | 'medium' | 'high';
  category: 'security' | 'vehicle' | 'system';
  data: any;
  created_at: string;
  updated_at: string;
}

export const useVehicleEvents = () => {
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicle_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents((data as VehicleEvent[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (
    eventType: string,
    eventMessage: string,
    vehicleId?: string,
    severity: 'low' | 'medium' | 'high' = 'low',
    category: 'security' | 'vehicle' | 'system' = 'system',
    additionalData?: any
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('log_vehicle_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_message: eventMessage,
        p_vehicle_id: vehicleId || null,
        p_severity: severity,
        p_category: category,
        p_data: additionalData || null
      });

      if (error) throw error;
      
      // Refresh events after logging
      await fetchEvents();
      
      return data;
    } catch (err) {
      console.error('Error logging event:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar evento');
      return null;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  // Set up realtime subscription for new events
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('vehicle_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vehicle_events',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newEvent = payload.new as VehicleEvent;
          setEvents(prevEvents => [newEvent, ...prevEvents.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    events,
    loading,
    error,
    logEvent,
    refetchEvents: fetchEvents
  };
};