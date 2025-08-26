import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  vehicles_count?: number;
  last_login?: string;
  status: 'active' | 'inactive';
}

interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'user';
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!user || profile?.role !== 'admin') {
      return;
    }

    try {
      setLoading(true);

      // Simplified query to avoid fetch errors
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name, role, created_at, updated_at, status, avatar_url, phone, address')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get vehicle counts for each user
      const userIds = profiles?.map(p => p.user_id) || [];
      let vehicleCountMap: Record<string, number> = {};
      
      if (userIds.length > 0) {
        const { data: vehicleCounts, error: vehicleError } = await supabase
          .from('vehicles')
          .select('user_id')
          .in('user_id', userIds);

        if (!vehicleError && vehicleCounts) {
          vehicleCountMap = vehicleCounts.reduce((acc, vehicle) => {
            acc[vehicle.user_id] = (acc[vehicle.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Transform profiles with actual vehicle counts
      const usersWithCounts = profiles?.map(profile => ({
        ...profile,
        vehicles_count: vehicleCountMap[profile.user_id] || 0,
        status: (profile.status || 'active') as 'active' | 'inactive',
      })) || [];

      setUsers(usersWithCounts);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, toast]);

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user, profile, fetchUsers]);

  // Listen for vehicle updates to refresh user data
  useEffect(() => {
    const handleRefresh = () => {
      if (user && profile?.role === 'admin') {
        fetchUsers();
      }
    };

    window.addEventListener('refreshUserData', handleRefresh);
    return () => window.removeEventListener('refreshUserData', handleRefresh);
  }, [user, profile, fetchUsers]);

  const createUser = async (userData: CreateUserData) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden crear usuarios",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      // Call the edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user-public', {
        body: userData
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Error creating user');
      }

      toast({
        title: "Usuario creado",
        description: `Usuario ${userData.first_name} ${userData.last_name} creado exitosamente`,
      });

      await fetchUsers(); // Refresh the list
      return { error: null };
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden actualizar usuarios",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      await fetchUsers();
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

  const deleteUser = async (userId: string) => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: "Error de permisos",
        description: "Solo administradores pueden eliminar usuarios",
        variant: "destructive",
      });
      return { error: new Error('Unauthorized') };
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      toast({
        title: "Operación no permitida",
        description: "No puedes eliminar tu propia cuenta de administrador",
        variant: "destructive",
      });
      return { error: new Error('Cannot delete own account') };
    }

    try {
      // First delete user's vehicles
      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .delete()
        .eq('user_id', userId);

      if (vehiclesError) throw vehiclesError;

      // Then delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      toast({
        title: "Usuario eliminado",
        description: "El usuario y sus vehículos han sido eliminados correctamente",
      });

      await fetchUsers();
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

  // Filter users based on search term and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}