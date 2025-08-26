import { User, Car, Bell, Edit, LogOut, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useNotifications } from '@/hooks/useNotifications';

interface ProfileProps {
  onShowNotifications: () => void;
}

export const Profile = ({ onShowNotifications }: ProfileProps) => {
  const { profile, signOut } = useAuth();
  const { vehicles } = useVehicles();
  const { notifications } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const primaryVehicle = vehicles[0]; // Use the first vehicle as primary
  const recentNotifications = notifications.slice(0, 3); // Show latest 3 notifications

  if (!profile) {
    return (
      <div className="p-4 pt-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pt-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
            {getInitials(profile.first_name, profile.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h1>
          <p className="text-sm text-muted-foreground">
            Miembro desde {new Date(profile.created_at).getFullYear()}
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <User className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Información Personal</CardTitle>
          <Button size="sm" variant="ghost" className="ml-auto">
            <Edit size={16} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{profile.email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{profile.phone}</p>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                </div>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{profile.address}</p>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card className="card-premium">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Car className="text-primary mr-2" size={20} />
            <CardTitle className="text-lg">Mis Vehículos ({vehicles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-3 border rounded-lg">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">Modelo</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{vehicle.plate}</p>
                          <p className="text-xs text-muted-foreground">Placa</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{vehicle.color}</p>
                          <p className="text-xs text-muted-foreground">Color</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{vehicle.year}</p>
                          <p className="text-xs text-muted-foreground">Año</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{vehicle.mileage.toLocaleString()} km</p>
                          <p className="text-xs text-muted-foreground">Kilometraje</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{vehicle.fuel_type}</p>
                          <p className="text-xs text-muted-foreground">Combustible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Car size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay vehículos asignados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Un administrador debe asignarte un vehículo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Recent Notifications */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Bell className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Notificaciones Recientes</CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-auto text-primary"
            onClick={onShowNotifications}
          >
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    notification.read
                      ? 'bg-muted/20 border-muted/20'
                      : 'bg-primary/10 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay notificaciones recientes
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Actions */}
      <Card className="card-premium">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Button className="w-full btn-primary justify-start">
              <Edit className="mr-2" size={18} />
              Editar Perfil
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2" size={18} />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};