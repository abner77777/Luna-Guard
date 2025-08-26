import { useState, useEffect } from 'react';
import { Car, Zap, Shield, Lock, Unlock, Power, PowerOff, Wifi, Radio, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleEvents } from '@/hooks/useVehicleEvents';
import { useSyncManager } from '@/hooks/useSyncManager';
import { useToast } from '@/hooks/use-toast';
import { MqttService } from '@/services/mqttService';

interface DeviceState {
  isLocked: boolean;
  hasPower: boolean;
  panic: boolean;
  lastUpdate: string;
  lastCommand?: string;
}

export const Dashboard = () => {
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { profile } = useAuth();
  const { vehicles, fetchVehicles } = useVehicles();
  const { logEvent } = useVehicleEvents();
  const { toast } = useToast();

  // Sync manager for coordinated updates
  const { isRefreshing, manualSync, getTimeSinceLastSync } = useSyncManager({
    onSync: async () => {
      await Promise.all([
        fetchVehicles(),
        fetchDeviceStatus(),
      ]);
    },
    interval: 60 * 60 * 1000, // 1 hour
    enablePullToRefresh: false, // Disable pull-to-refresh to avoid accidental triggers
  });

  const primaryVehicle = vehicles[0]; // Use the first vehicle as primary

  // Derived states from device
  const isLocked = deviceState?.isLocked ?? true;
  const engineRunning = deviceState?.hasPower ?? false;
  
  // Vehicle status based on real device state
  const vehicleStatus = {
    
    signalStrength: isServerOnline ? 4 : 0,
    isOnline: deviceState !== null && isServerOnline,
    lastUpdate: deviceState?.lastUpdate 
      ? new Date(deviceState.lastUpdate).toLocaleTimeString() 
      : 'Sin datos',
  };

  // Function to fetch device status from server
  const fetchDeviceStatus = async () => {
    try {
      const [serverHealth, deviceStatus] = await Promise.all([
        MqttService.checkServerHealth(),
        MqttService.getDeviceStatus()
      ]);
      
      setIsServerOnline(serverHealth);
      setDeviceState(deviceStatus);
    } catch (error) {
      console.error('Error fetching device status:', error);
      setIsServerOnline(false);
      setDeviceState(null);
    }
  };

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initial device status fetch
    fetchDeviceStatus();

    // Check device status every 30 seconds (keep for real-time device updates)
    const statusTimer = setInterval(fetchDeviceStatus, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  const handleLockToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setIsRotating(true);
    
    try {
      const command = isLocked ? 'unlock' : 'lock';
      const success = await MqttService.sendCommand(command);
      
      if (success) {
        // Log the event
        await logEvent(
          isLocked ? 'vehicle_unlocked' : 'vehicle_locked',
          isLocked ? 'Vehículo desbloqueado por usuario' : 'Vehículo bloqueado por usuario',
          primaryVehicle?.id,
          'medium',
          'security'
        );
        
        // Show success toast
        toast({
          title: isLocked ? "Vehículo desbloqueado" : "Vehículo bloqueado",
          description: isLocked ? "El vehículo ha sido desbloqueado exitosamente" : "El vehículo ha sido bloqueado exitosamente",
        });
        
        // Wait a moment for the device to process, then fetch updated status
        setTimeout(async () => {
          await fetchDeviceStatus();
          setIsRotating(false);
          setIsLoading(false);
        }, 1000);
      } else {
        // Command failed, revert animation
        setIsRotating(false);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "No se pudo enviar el comando al dispositivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      setIsRotating(false);
      setIsLoading(false);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el dispositivo",
        variant: "destructive",
      });
    }
  };

  const handleEngineToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const command = engineRunning ? 'disconnect' : 'reconnect';
      const success = await MqttService.sendCommand(command);
      
      if (success) {
        // Log the event
        await logEvent(
          engineRunning ? 'engine_disconnected' : 'engine_connected',
          engineRunning ? 'Motor desconectado por usuario' : 'Motor conectado por usuario',
          primaryVehicle?.id,
          'medium',
          'vehicle'
        );
        
        // Show success toast
        toast({
          title: engineRunning ? "Motor desconectado" : "Motor conectado",
          description: engineRunning ? "La energía del motor ha sido cortada" : "El motor ha sido reconectado",
        });
        
        // Wait a moment for the device to process, then fetch updated status
        setTimeout(async () => {
          await fetchDeviceStatus();
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "No se pudo enviar el comando al dispositivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error toggling engine:', error);
      setIsLoading(false);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el dispositivo",
        variant: "destructive",
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {profile?.first_name || 'Usuario'}!
          </h1>
          <p className="text-sm text-muted-foreground">{currentTime.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            Última sincronización: {getTimeSinceLastSync()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={manualSync}
            disabled={isRefreshing}
            className="p-2"
          >
            <RefreshCw 
              size={16} 
              className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </Button>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-3 rounded mx-0.5 ${
                  i < vehicleStatus.signalStrength ? 'bg-success' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <Radio size={16} className="text-success" />
        </div>
      </div>

      {/* Vehicle Info Card */}
      {primaryVehicle ? (
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Car className="text-primary mr-2" size={24} />
            <CardTitle className="text-lg">{primaryVehicle.model}</CardTitle>
            <div className={`ml-auto w-3 h-3 rounded-full ${vehicleStatus.isOnline ? 'bg-success animate-pulse-glow' : 'bg-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Placa: <span className="text-foreground font-medium">{primaryVehicle.plate}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Color: <span className="text-foreground font-medium">{primaryVehicle.color}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Kilometraje: <span className="text-foreground font-medium">{primaryVehicle.mileage.toLocaleString()} km</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Última actualización: <span className="text-foreground">{vehicleStatus.lastUpdate}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-premium">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Car size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay vehículos asignados
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Un administrador debe asignarte un vehículo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleLockToggle}
              className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                isLocked ? 'btn-success' : 'btn-warning'
              }`}
              disabled={isLoading || isRotating || !primaryVehicle || !isServerOnline}
            >
              {isLocked ? (
                <Lock className={`${isRotating ? 'animate-rotate' : ''}`} size={24} />
              ) : (
                <Unlock className={`${isRotating ? 'animate-rotate' : ''}`} size={24} />
              )}
              <span className="text-sm font-medium text-center">
                {isLocked ? (
                  <>Tap para<br />desbloquear</>
                ) : (
                  <>Tap para<br />bloquear</>
                )}
              </span>
            </Button>

            <Button
              onClick={handleEngineToggle}
              className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                engineRunning ? 'btn-danger' : 'btn-primary'
              }`}
              disabled={isLoading || !primaryVehicle || !isServerOnline}
            >
              {engineRunning ? (
                <PowerOff size={24} />
              ) : (
                <Power size={24} />
              )}
              <span className="text-sm font-medium text-center">
                {engineRunning ? (
                  <>Tap para cortar<br />corriente</>
                ) : (
                  <>Tap para<br />reconectar corriente</>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Estado del Vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap size={20} className={engineRunning ? 'text-success' : 'text-muted-foreground'} />
                <span className="text-sm">Energización</span>
              </div>
              <div className={`flex items-center space-x-2 ${engineRunning ? 'animate-pulse-glow' : ''}`}>
                <div className={`w-3 h-3 rounded-full ${engineRunning ? 'bg-success' : 'bg-muted'}`} />
                <span className="text-sm font-medium">
                  {engineRunning ? 'Energizado' : 'Apagado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi size={20} className="text-primary" />
                <span className="text-sm">Conexión MQTT</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isServerOnline ? 'bg-success animate-pulse-glow' : 'bg-destructive'
                }`} />
                <span className={`text-sm font-medium ${
                  isServerOnline ? 'text-success' : 'text-destructive'
                }`}>
                  {isServerOnline ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Shield className="text-primary mr-2" size={20} />
          <CardTitle className="text-base">Estado de Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Sistema de bloqueo</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isLocked ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
            }`}>
              {isLocked ? 'Activo' : 'Inactivo'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Última verificación: {deviceState?.lastUpdate 
              ? new Date(deviceState.lastUpdate).toLocaleString()
              : 'Sin datos'}
          </p>
          {deviceState?.lastCommand && (
            <p className="text-xs text-muted-foreground mt-1">
              Último comando: <span className="font-medium">{deviceState.lastCommand}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};