import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'user_created' | 'user_updated' | 'vehicle_created' | 'vehicle_updated' | 'vehicle_assigned';
  description: string;
  timestamp: string;
  user_name?: string;
  vehicle_info?: string;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    inactiveVehicles: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const fetchStats = async () => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden acceder a estas estadísticas",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Fetch user statistics
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, role, created_at')
        .eq('role', 'user');

      if (usersError) throw usersError;

      // Fetch vehicle statistics
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, user_id, model, plate, created_at, updated_at');

      if (vehiclesError) throw vehiclesError;

      // Calculate statistics
      const totalUsers = users?.length || 0;
      const activeUsers = totalUsers; // For now, all users are considered active
      const inactiveUsers = 0;

      const totalVehicles = vehicles?.length || 0;
      const activeVehicles = totalVehicles; // For now, all vehicles are considered active
      const inactiveVehicles = 0;

      // Generate recent activities (mock data for now)
      const recentActivities: Activity[] = [
        ...users?.slice(-3).map(user => ({
          id: `user_${user.id}`,
          type: 'user_created' as const,
          description: `Nuevo usuario registrado`,
          timestamp: user.created_at,
          user_name: `Usuario ID: ${user.id.slice(0, 8)}`,
        })) || [],
        ...vehicles?.slice(-3).map(vehicle => ({
          id: `vehicle_${vehicle.id}`,
          type: 'vehicle_created' as const,
          description: `Nuevo vehículo registrado`,
          timestamp: vehicle.created_at,
          vehicle_info: `${vehicle.model} - ${vehicle.plate}`,
        })) || [],
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalVehicles,
        activeVehicles,
        inactiveVehicles,
        recentActivities,
      });
    } catch (error: any) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    fetchStats,
  };
}