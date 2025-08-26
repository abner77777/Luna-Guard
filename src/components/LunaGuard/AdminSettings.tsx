import { LogOut, User, Shield, Bell, Database, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export const AdminSettings = () => {
  const { profile, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleExportData = () => {
    // In a real implementation, this would export system data
    console.log('Exporting data...');
  };

  const handleImportData = () => {
    // In a real implementation, this would import system data
    console.log('Importing data...');
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="text-primary" size={24} />
        <h1 className="text-xl font-bold text-foreground">Configuración Admin</h1>
      </div>

      {/* Admin Profile */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <User className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Perfil de Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  Administrador
                </div>
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-border/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID: {profile?.id.slice(0, 8)}...</p>
              <p>Registro: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : 'N/A'}</p>
              <p>Última actualización: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Notificaciones</p>
                <p className="text-xs text-muted-foreground">Recibir alertas del sistema</p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>


          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Seguimiento de uso del sistema</p>
              </div>
            </div>
            <Switch
              checked={analyticsEnabled}
              onCheckedChange={setAnalyticsEnabled}
            />
          </div>
        </CardContent>
      </Card>


      {/* System Information */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versión</p>
              <p className="font-medium">Luna-guard v1.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estado</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="font-medium text-success">Operativo</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Base de Datos</p>
              <p className="font-medium">Supabase</p>
            </div>
            <div>
              <p className="text-muted-foreground">Región</p>
              <p className="font-medium">US East</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Sistema desplegado y funcionando correctamente. 
              Todos los servicios están operativos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Logout */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Sesión cifrada con tokens JWT</p>
            <p>• Autenticación de dos factores disponible</p>
            <p>• Logs de auditoría habilitados</p>
            <p>• Respaldos automáticos configurados</p>
          </div>
          
          <div className="pt-3 border-t border-border/30">
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        <p>Luna-guard Admin Panel</p>
        <p>© 2024 - Sistema de Gestión Vehicular</p>
      </div>
    </div>
  );
};