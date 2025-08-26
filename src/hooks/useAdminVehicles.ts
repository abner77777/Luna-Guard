import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface AdminVehicle {
  id: string;
  user_id: string;
  model: string;
  plate: string;
  color: string;
  year: number;
  engine: string;
  fuel_type: 'gasolina' | 'diesel' | 'electrico' | 'hibrido';
  mileage: number;
  vin: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
  owner_name?: string;
  owner_email?: string;
}

interface VehicleFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive';
  fuelTypeFilter: 'all' | 'gasolina' | 'diesel' | 'electrico' | 'hibrido';
  yearFilter: string;
  ownerFilter: string;
}

export function useAdminVehicles() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VehicleFilters>({
    searchTerm: '',
    statusFilter: 'all',
    fuelTypeFilter: 'all',
    yearFilter: '',
    ownerFilter: '',
  });
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchVehicles = useCallback(async () => {
    if (!user || profile?.role !== 'admin') {
      return;
    }

    try {
      setLoading(true);

      // Simplified query - get vehicles first, then profiles separately to avoid relation errors
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Get unique user IDs
      const userIds = [...new Set(vehiclesData?.map(v => v.user_id) || [])];
      
      // Fetch profiles separately if we have user IDs
      let profilesData = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);

        if (profilesError) {
          console.warn('Could not fetch profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Create profile map
      const profileMap = profilesData.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Transform data
      const vehiclesWithOwners = vehiclesData?.map(vehicle => {
        const profile = profileMap[vehicle.user_id];
        return {
          ...vehicle,
          status: 'active' as const,
          owner_name: profile 
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : 'Usuario desconocido',
          owner_email: profile?.email || 'Email no disponible',
        };
      }) || [];

      setVehicles(vehiclesWithOwners);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, toast]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [user, profile, fetchVehicles]);

  // Listen for vehicle updates to refresh the list
  useEffect(() => {
    const handleRefresh = () => {
      if (user && profile?.role === 'admin') {
        fetchVehicles();
      }
    };

    window.addEventListener('refreshVehicleData', handleRefresh);
    return () => window.removeEventListener('refreshVehicleData', handleRefresh);
  }, [user, profile, fetchVehicles]);

  const addVehicle = async (vehicleData: Omit<AdminVehicle, 'id' | 'created_at' | 'updated_at' | 'status' | 'owner_name' | 'owner_email'>) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden agregar vehículos",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      console.log('Inserting vehicle data:', vehicleData);
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      toast({
        title: "Vehículo agregado",
        description: "El vehículo se ha registrado correctamente",
      });

      // Refresh vehicles and trigger global refresh events
      await fetchVehicles();
      
      // Trigger events to refresh both user and vehicle data across all components
      window.dispatchEvent(new CustomEvent('refreshUserData'));
      window.dispatchEvent(new CustomEvent('refreshVehicleData'));

      return { data, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateVehicle = async (vehicleId: string, updates: Partial<AdminVehicle>) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden actualizar vehículos",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Vehículo actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      await fetchVehicles();
      window.dispatchEvent(new CustomEvent('refreshVehicleData'));
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden eliminar vehículos",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Vehículo eliminado",
        description: "El vehículo se ha eliminado correctamente",
      });

      await fetchVehicles();
      window.dispatchEvent(new CustomEvent('refreshVehicleData'));
      window.dispatchEvent(new CustomEvent('refreshUserData'));
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const reassignVehicle = async (vehicleId: string, newOwnerId: string) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden reasignar vehículos",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ user_id: newOwnerId })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Vehículo reasignado",
        description: "El vehículo ha sido reasignado correctamente",
      });

      await fetchVehicles();
      window.dispatchEvent(new CustomEvent('refreshVehicleData'));
      window.dispatchEvent(new CustomEvent('refreshUserData'));
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Filter vehicles based on current filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = filters.searchTerm === '' || 
      vehicle.model.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      vehicle.owner_name?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesStatus = filters.statusFilter === 'all' || vehicle.status === filters.statusFilter;
    const matchesFuelType = filters.fuelTypeFilter === 'all' || vehicle.fuel_type === filters.fuelTypeFilter;
    const matchesYear = filters.yearFilter === '' || vehicle.year.toString() === filters.yearFilter;
    const matchesOwner = filters.ownerFilter === '' || 
      vehicle.owner_name?.toLowerCase().includes(filters.ownerFilter.toLowerCase()) ||
      vehicle.owner_email?.toLowerCase().includes(filters.ownerFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesFuelType && matchesYear && matchesOwner;
  });

  return {
    vehicles: filteredVehicles,
    loading,
    filters,
    setFilters,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    reassignVehicle,
  };
}