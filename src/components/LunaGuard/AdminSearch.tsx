import { useState } from 'react';
import { Search, Users, Car, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminVehicles } from '@/hooks/useAdminVehicles';

export const AdminSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'users' | 'vehicles'>('all');
  
  const { users } = useAdminUsers();
  const { vehicles } = useAdminVehicles();

  // Universal search function
  const performSearch = () => {
    if (!searchQuery.trim()) return { users: [], vehicles: [] };

    const query = searchQuery.toLowerCase().trim();

    // Search users
    const matchingUsers = users.filter(user => 
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query) ||
      user.user_id.toLowerCase().includes(query)
    );

    // Search vehicles
    const matchingVehicles = vehicles.filter(vehicle =>
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.plate.toLowerCase().includes(query) ||
      vehicle.vin.toLowerCase().includes(query) ||
      vehicle.color.toLowerCase().includes(query) ||
      vehicle.engine.toLowerCase().includes(query) ||
      vehicle.id.toLowerCase().includes(query) ||
      vehicle.owner_name?.toLowerCase().includes(query) ||
      vehicle.owner_email?.toLowerCase().includes(query)
    );

    return { users: matchingUsers, vehicles: matchingVehicles };
  };

  const searchResults = performSearch();
  const hasResults = searchResults.users.length > 0 || searchResults.vehicles.length > 0;
  const showResults = searchQuery.trim().length > 0;

  const generateQRCode = (type: 'user' | 'vehicle', id: string) => {
    // In a real implementation, this would generate a QR code
    const qrData = `${type.toUpperCase()}-${id}`;
    return qrData;
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Search className="text-primary" size={24} />
        <h1 className="text-xl font-bold text-foreground">Búsqueda Universal</h1>
      </div>

      {/* Search Input */}
      <Card className="card-premium">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar usuarios, vehículos, placas, VIN, emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={searchType === 'all' ? 'default' : 'outline'}
              onClick={() => setSearchType('all')}
              className="flex-1"
            >
              Todo
            </Button>
            <Button
              size="sm"
              variant={searchType === 'users' ? 'default' : 'outline'}
              onClick={() => setSearchType('users')}
              className="flex-1"
            >
              <Users size={14} className="mr-1" />
              Usuarios
            </Button>
            <Button
              size="sm"
              variant={searchType === 'vehicles' ? 'default' : 'outline'}
              onClick={() => setSearchType('vehicles')}
              className="flex-1"
            >
              <Car size={14} className="mr-1" />
              Vehículos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showResults && (
        <>
          {!hasResults ? (
            <Card className="card-premium">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Search size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No se encontraron resultados para "{searchQuery}"
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Intenta con términos diferentes o verifica la ortografía
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Users Results */}
              {(searchType === 'all' || searchType === 'users') && searchResults.users.length > 0 && (
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 text-primary" size={20} />
                      Usuarios ({searchResults.users.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {searchResults.users.map((user) => (
                      <div key={user.id} className="p-3 border border-border/30 rounded-lg bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {user.first_name} {user.last_name}
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>📧 {user.email}</p>
                              {user.phone && <p>📱 {user.phone}</p>}
                              <p>🚗 {user.vehicles_count} vehículo{user.vehicles_count !== 1 ? 's' : ''}</p>
                              <p className="text-xs">ID: {user.id.slice(0, 12)}...</p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 ml-4">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <QrCode size={12} className="mr-1" />
                              QR
                            </Button>
                            <div className={`px-2 py-0.5 rounded-full text-xs text-center ${
                              user.status === 'active' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-muted/20 text-muted-foreground'
                            }`}>
                              {user.status === 'active' ? 'Activo' : 'Inactivo'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Vehicles Results */}
              {(searchType === 'all' || searchType === 'vehicles') && searchResults.vehicles.length > 0 && (
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Car className="mr-2 text-primary" size={20} />
                      Vehículos ({searchResults.vehicles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {searchResults.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-3 border border-border/30 rounded-lg bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {vehicle.model} ({vehicle.year})
                            </h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>🚗 <strong>Placa:</strong> {vehicle.plate}</p>
                              <p>🎨 <strong>Color:</strong> {vehicle.color}</p>
                              <p>⛽ {vehicle.fuel_type}</p>
                              <p>👤 <strong>Propietario:</strong> {vehicle.owner_name}</p>
                              <p className="text-xs">VIN: {vehicle.vin}</p>
                              <p className="text-xs">ID: {vehicle.id.slice(0, 12)}...</p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 ml-4">
                            <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                              <QrCode size={12} className="mr-1" />
                              QR
                            </Button>
                            <div className={`px-2 py-0.5 rounded-full text-xs text-center ${
                              vehicle.status === 'active' 
                                ? 'bg-success/20 text-success' 
                                : 'bg-muted/20 text-muted-foreground'
                            }`}>
                              {vehicle.status === 'active' ? 'Activo' : 'Inactivo'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Search Summary */}
              <Card className="card-premium">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-foreground">Resumen de Búsqueda</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-lg font-bold text-primary">{searchResults.users.length}</div>
                        <div className="text-muted-foreground">Usuarios encontrados</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">{searchResults.vehicles.length}</div>
                        <div className="text-muted-foreground">Vehículos encontrados</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Search Tips */}
      {!showResults && (
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="text-lg">Consejos de Búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Buscar usuarios:</strong> Nombre, apellido, email, teléfono o ID</p>
              <p><strong>Buscar vehículos:</strong> Modelo, placa, VIN, color o propietario</p>
              <p><strong>IDs únicos:</strong> Formato CLI-000001 (usuarios) o VEH-000001 (vehículos)</p>
              <p><strong>Búsqueda universal:</strong> Encuentra cualquier coincidencia en todo el sistema</p>
            </div>
            
          </CardContent>
        </Card>
      )}
    </div>
  );
};