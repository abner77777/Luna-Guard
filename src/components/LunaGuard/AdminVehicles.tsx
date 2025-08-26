import { useState } from 'react';
import { Search, Car, Edit, Trash2, Eye, Filter, Plus, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdminVehicles } from '@/hooks/useAdminVehicles';
import { CreateVehicleDialog } from './CreateVehicleDialog';

export const AdminVehicles = () => {
  const {
    vehicles,
    loading,
    filters,
    setFilters,
    deleteVehicle,
  } = useAdminVehicles();

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const handleDeleteVehicle = async (vehicleId: string) => {
    await deleteVehicle(vehicleId);
    setSelectedVehicle(null);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const labels = {
      gasolina: 'Gasolina',
      diesel: 'Diésel',
      electrico: 'Eléctrico',
      hibrido: 'Híbrido',
    };
    return labels[fuelType as keyof typeof labels] || fuelType;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-success/20 text-success' 
      : 'bg-muted/20 text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">Gestión de Vehículos</h1>
        </div>
        <div className="flex items-center space-x-4">
          <CreateVehicleDialog />
          <div className="text-sm text-muted-foreground">
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="card-premium">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar por modelo, placa, VIN o propietario..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select value={filters.statusFilter} onValueChange={(value: any) => updateFilter('statusFilter', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.fuelTypeFilter} onValueChange={(value: any) => updateFilter('fuelTypeFilter', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Combustible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="gasolina">Gasolina</SelectItem>
                <SelectItem value="diesel">Diésel</SelectItem>
                <SelectItem value="electrico">Eléctrico</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Año"
              value={filters.yearFilter}
              onChange={(e) => updateFilter('yearFilter', e.target.value)}
              type="number"
            />
            <Input
              placeholder="Propietario"
              value={filters.ownerFilter}
              onChange={(e) => updateFilter('ownerFilter', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vehicles List */}
      <div className="space-y-3">
        {vehicles.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Car size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No se encontraron vehículos
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {filters.searchTerm || filters.statusFilter !== 'all' || filters.fuelTypeFilter !== 'all' || filters.yearFilter || filters.ownerFilter
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'No hay vehículos registrados en el sistema'}
              </p>
            </CardContent>
          </Card>
        ) : (
          vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="card-premium">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {vehicle.model} ({vehicle.year})
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status === 'active' ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>🚗 <strong>Placa:</strong> {vehicle.plate}</p>
                      <p>🎨 <strong>Color:</strong> {vehicle.color}</p>
                      <p>⛽ <strong>Combustible:</strong> {getFuelTypeLabel(vehicle.fuel_type)}</p>
                      <p>🔧 <strong>Motor:</strong> {vehicle.engine}</p>
                      <p>📏 <strong>Kilometraje:</strong> {vehicle.mileage.toLocaleString()} km</p>
                      <p>🏷️ <strong>VIN:</strong> {vehicle.vin}</p>
                      
                      <div className="pt-2 border-t border-border/30">
                        <div className="flex items-center space-x-1">
                          <UserCheck size={14} />
                          <span><strong>Propietario:</strong> {vehicle.owner_name}</span>
                        </div>
                        {vehicle.owner_email && (
                          <p className="ml-5">📧 {vehicle.owner_email}</p>
                        )}
                      </div>
                      
                      <p className="text-xs pt-1">
                        ID: {vehicle.id.slice(0, 8)}... | Registro: {new Date(vehicle.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                      <Eye size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                      <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                      <UserCheck size={14} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-8 h-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente el vehículo "{vehicle.model} - {vehicle.plate}". 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVehicle(vehicle.id)}
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
      {vehicles.length > 0 && (
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-foreground">{vehicles.length}</div>
                <div className="text-muted-foreground">Mostrados</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {vehicles.filter(v => v.fuel_type === 'electrico').length}
                </div>
                <div className="text-muted-foreground">Eléctricos</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  {Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length).toLocaleString()}
                </div>
                <div className="text-muted-foreground">Km promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};