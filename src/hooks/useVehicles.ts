import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface Vehicle {
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
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVehicles();
    } else {
      setVehicles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los vehículos",
          variant: "destructive",
        });
        return;
      }

      setVehicles(data || []);
    } catch (error) {
      console.error('Error in fetchVehicles:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar vehículos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Vehículo agregado",
        description: "El vehículo se ha registrado correctamente",
      });

      await fetchVehicles();
      return { data, error: null };
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

  const updateVehicle = async (vehicleId: string, updates: Partial<Vehicle>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Vehículo actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      await fetchVehicles();
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
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Vehículo eliminado",
        description: "El vehículo se ha eliminado correctamente",
      });

      await fetchVehicles();
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

  return {
    vehicles,
    loading,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
}