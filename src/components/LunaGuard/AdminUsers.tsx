import { useState } from 'react';
import { Search, Users, Edit, Trash2, Eye, Filter, UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';

export const AdminUsers = () => {
  const {
    users,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    createUser,
    updateUser,
    deleteUser,
  } = useAdminUsers();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(user.user_id, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full mobile-scroll">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Gestión de Usuarios</h1>
        </div>
        <div className="flex items-center space-x-4">
          <CreateUserDialog onCreateUser={createUser} />
          <div className="text-sm text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-premium">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No se encontraron usuarios
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {searchTerm ? 'Intenta ajustar los filtros de búsqueda' : 'No hay usuarios registrados en el sistema'}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {user.first_name} {user.last_name}
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary/20 text-secondary-foreground'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-muted/20 text-muted-foreground'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>📧 {user.email}</p>
                      {user.phone && <p>📱 {user.phone}</p>}
                      {user.address && <p>📍 {user.address}</p>}
                      <p>🚗 {user.vehicles_count || 0} vehículo{(user.vehicles_count || 0) !== 1 ? 's' : ''}</p>
                      <p className="text-xs">
                        ID: {user.id.slice(0, 8)}... | Registro: {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-8 h-8 p-0"
                      onClick={() => handleToggleStatus(user)}
                      title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-8 h-8 p-0"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente al usuario "{user.first_name} {user.last_name}" 
                            y todos sus vehículos ({user.vehicles_count || 0}). Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {users.length > 0 && (
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">{users.length}</div>
                <div className="text-xs text-muted-foreground">Usuarios mostrados</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {users.reduce((total, user) => total + (user.vehicles_count || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total vehículos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateUser={updateUser}
      />
    </div>
  );
};