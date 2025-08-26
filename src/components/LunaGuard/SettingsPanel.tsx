import { useState, useEffect } from 'react';
import { Settings, Wifi, Server, Shield, Lock, Smartphone, Volume2, Vibrate, Info, CheckCircle, XCircle, AlertTriangle, Car, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MqttService } from '@/services/mqttService';

interface DeviceState {
  isLocked: boolean;
  hasPower: boolean;
  panic: boolean;
  lastUpdate: string;
  lastCommand?: string;
}

interface SystemStatus {
  internet: boolean;
  mqttServer: boolean;
  deviceOnline: boolean;
  deviceState: DeviceState | null;
  lastCheck: Date;
}

export const SettingsPanel = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    internet: false,
    mqttServer: false,
    deviceOnline: false,
    deviceState: null,
    lastCheck: new Date(),
  });

  const [securitySettings, setSecuritySettings] = useState({
    biometricLock: true,
    autoLock: true,
    emergencyMode: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    security: true,
    vehicle: true,
    system: true,
    sound: true,
    vibration: true,
  });

  const checkSystemStatus = async () => {
    setSystemStatus(prev => ({ ...prev, lastCheck: new Date() }));
    
    try {
      // Check internet connectivity
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });

      // Use MqttService for server and device checks
      const [serverHealth, deviceStatus] = await Promise.all([
        MqttService.checkServerHealth(),
        MqttService.getDeviceStatus()
      ]);
      
      // Consider device online if we got a recent update (within last 5 minutes)
      const deviceOnlineStatus = deviceStatus ? (() => {
        const lastUpdate = new Date(deviceStatus.lastUpdate);
        const now = new Date();
        const timeDiff = (now.getTime() - lastUpdate.getTime()) / 1000 / 60; // minutes
        return timeDiff < 5;
      })() : false;

      // Update emergency mode from device state
      if (deviceStatus) {
        setSecuritySettings(prev => ({ 
          ...prev, 
          emergencyMode: deviceStatus.panic 
        }));
      }
      
      setSystemStatus(prev => ({
        ...prev,
        internet: true,
        mqttServer: serverHealth,
        deviceOnline: deviceOnlineStatus,
        deviceState: deviceStatus,
      }));
    } catch (error) {
      console.log('Status check failed:', error);
      setSystemStatus(prev => ({
        ...prev,
        internet: false,
        mqttServer: false,
        deviceOnline: false,
        deviceState: null,
      }));
    }
  };

  useEffect(() => {
    // Initial check
    checkSystemStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyModeToggle = async (checked: boolean) => {
    if (isLoading || !systemStatus.mqttServer) return;
    
    setIsLoading(true);
    
    try {
      const command = checked ? 'panic' : 'no-panic';
      const success = await MqttService.sendCommand(command);
      
      if (success) {
        // Update local state immediately for better UX
        setSecuritySettings(prev => ({ ...prev, emergencyMode: checked }));
        
        // Wait a moment for the device to process, then fetch updated status
        setTimeout(async () => {
          await checkSystemStatus();
          setIsLoading(false);
        }, 1000);
      } else {
        setIsLoading(false);
        console.error('Failed to send panic command');
      }
    } catch (error) {
      console.error('Error toggling emergency mode:', error);
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle size={16} className="text-success" />;
    }
    return <XCircle size={16} className="text-destructive" />;
  };

  return (
    <div className="p-4 space-y-4 pt-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="text-primary" size={28} />
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      {/* System Status */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Server className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-auto text-primary"
            onClick={checkSystemStatus}
          >
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi size={20} className="text-muted-foreground" />
                <span className="text-sm">Conexión a Internet</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.internet)}
                <span className={`text-sm font-medium ${
                  systemStatus.internet ? 'text-success' : 'text-destructive'
                }`}>
                  {systemStatus.internet ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server size={20} className="text-muted-foreground" />
                <span className="text-sm">Servidor MQTT</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.mqttServer)}
                <span className={`text-sm font-medium ${
                  systemStatus.mqttServer ? 'text-success' : 'text-destructive'
                }`}>
                  {systemStatus.mqttServer ? 'Operativo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car size={20} className="text-muted-foreground" />
                <span className="text-sm">Dispositivo IoT</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.deviceOnline)}
                <span className={`text-sm font-medium ${
                  systemStatus.deviceOnline ? 'text-success' : 'text-destructive'
                }`}>
                  {systemStatus.deviceOnline ? 'En Línea' : 'Sin Conexión'}
                </span>
              </div>
            </div>

            {systemStatus.deviceState && (
              <div className="pt-3 border-t border-border space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Estado del Dispositivo</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Lock size={16} className={systemStatus.deviceState.isLocked ? 'text-red-500' : 'text-green-500'} />
                    <span className="text-xs">
                      {systemStatus.deviceState.isLocked ? 'Bloqueado' : 'Desbloqueado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Power size={16} className={systemStatus.deviceState.hasPower ? 'text-green-500' : 'text-red-500'} />
                    <span className="text-xs">
                      {systemStatus.deviceState.hasPower ? 'Con Energía' : 'Sin Energía'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 col-span-2">
                    <AlertTriangle size={16} className={systemStatus.deviceState.panic ? 'text-red-500 animate-pulse' : 'text-green-500'} />
                    <span className={`text-xs ${systemStatus.deviceState.panic ? 'text-red-500 font-medium' : ''}`}>
                      {systemStatus.deviceState.panic ? '🚨 MODO PÁNICO ACTIVO' : 'Modo Normal'}
                    </span>
                  </div>
                </div>
                
                {systemStatus.deviceState.lastCommand && (
                  <div className="text-xs text-muted-foreground">
                    Último comando: <span className="font-medium">{systemStatus.deviceState.lastCommand}</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Última actualización: {new Date(systemStatus.deviceState.lastUpdate).toLocaleString()}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Última verificación: {systemStatus.lastCheck.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Shield className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Configuración de Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bloqueo Biométrico</p>
                  <p className="text-xs text-muted-foreground">Usar huella dactilar o Face ID</p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.biometricLock}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, biometricLock: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bloqueo Automático</p>
                  <p className="text-xs text-muted-foreground">Bloquear después de inactividad</p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.autoLock}
                onCheckedChange={(checked) => 
                  setSecuritySettings(prev => ({ ...prev, autoLock: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={20} className={securitySettings.emergencyMode ? "text-red-500" : "text-warning"} />
                <div>
                  <p className="text-sm font-medium">Modo de Emergencia</p>
                  <p className="text-xs text-muted-foreground">
                    {securitySettings.emergencyMode ? 'Modo pánico activado' : 'Activar en situaciones críticas'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={securitySettings.emergencyMode}
                onCheckedChange={handleEmergencyModeToggle}
                disabled={isLoading || !systemStatus.mqttServer}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Configuración de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Tipos de Notificaciones</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alertas de Seguridad</span>
                  <Switch 
                    checked={notificationSettings.security}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, security: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado del Vehículo</span>
                  <Switch 
                    checked={notificationSettings.vehicle}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, vehicle: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificaciones del Sistema</span>
                  <Switch 
                    checked={notificationSettings.system}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, system: checked }))
                    }
                  />
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Info className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Información de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Versión</span>
              <span className="text-sm font-medium">1.2.3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Última actualización</span>
              <span className="text-sm font-medium">15 Ago 2025</span>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                © 2025 Luna-guard. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};