import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Clock, Wifi, Battery, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBattery } from '@/hooks/useBattery';
import { useVehicleEvents } from '@/hooks/useVehicleEvents';


export const Security = () => {
  const batteryInfo = useBattery();
  const { events, loading: eventsLoading, logEvent } = useVehicleEvents();
  const [systemStatus, setSystemStatus] = useState({
    monitoring: true,
    network: true,
    lastCheck: new Date(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastCheck: new Date(),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield size={16} className="text-primary" />;
      case 'vehicle':
        return <CheckCircle size={16} className="text-success" />;
      case 'system':
        return <AlertTriangle size={16} className="text-warning" />;
      default:
        return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/20 text-warning border-warning/20';
      case 'low':
        return 'bg-success/20 text-success border-success/20';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="p-4 space-y-4 pt-8">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="text-primary" size={28} />
        <h1 className="text-2xl font-bold">Seguridad</h1>
        <div className="ml-auto w-3 h-3 rounded-full bg-success animate-pulse-glow" />
      </div>

      {/* Real-time Monitoring Status */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
            Monitoreo en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Wifi size={20} className={systemStatus.network ? 'text-success' : 'text-destructive'} />
              <div>
                <p className="text-sm font-medium">Conexión</p>
                <p className={`text-xs ${systemStatus.network ? 'text-success' : 'text-destructive'}`}>
                  {systemStatus.network ? 'Estable' : 'Desconectado'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Battery size={20} className={batteryInfo.charging ? 'text-success' : 'text-primary'} />
                {batteryInfo.charging && (
                  <Zap size={12} className="absolute -top-1 -right-1 text-success animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Batería Dispositivo</p>
                <div className="flex items-center space-x-2">
                  {batteryInfo.supported ? (
                    <>
                      <p className={`text-xs ${batteryInfo.level < 0.2 ? 'text-destructive' : batteryInfo.level < 0.5 ? 'text-warning' : 'text-success'}`}>
                        {Math.round(batteryInfo.level * 100)}%
                      </p>
                      {batteryInfo.charging && (
                        <span className="text-xs text-success">Cargando</span>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Última verificación: {systemStatus.lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>


      {/* Security Events History */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Historial de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay eventos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getEventIcon(event.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {event.event_message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity === 'high' ? 'Alta' : event.severity === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};