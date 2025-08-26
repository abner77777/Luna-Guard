import { Bell, ArrowLeft, Shield, Car, Settings, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/useNotifications';
import { useState } from 'react';

interface NotificationsProps {
  onBack: () => void;
}

export const Notifications = ({ onBack }: NotificationsProps) => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const [notificationSettings, setNotificationSettings] = useState({
    security: true,
    vehicle: true,
    system: true,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield size={20} className="text-destructive" />;
      case 'vehicle':
        return <Car size={20} className="text-primary" />;
      case 'system':
        return <Settings size={20} className="text-warning" />;
      default:
        return <Bell size={20} className="text-muted-foreground" />;
    }
  };

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'border-l-destructive bg-destructive/5';
      case 'vehicle':
        return 'border-l-primary bg-primary/5';
      case 'system':
        return 'border-l-warning bg-warning/5';
      default:
        return 'border-l-muted bg-muted/5';
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-primary" />
          <h1 className="text-xl font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <div className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </div>
          )}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border bg-card">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-b-2 transition-colors ${
            activeTab === 'list'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-transparent text-muted-foreground'
          }`}
          onClick={() => setActiveTab('list')}
        >
          Lista
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-primary text-primary bg-primary/10'
              : 'border-transparent text-muted-foreground'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Configuración
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === 'list' ? (
          <div className="p-4 space-y-4">
            {/* Actions */}
            {unreadCount > 0 && (
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                  <Check size={16} className="mr-1" />
                  Marcar todas como leídas
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card className="card-premium">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Bell size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No tienes notificaciones
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`card-premium border-l-4 transition-all duration-200 cursor-pointer ${
                      getPriorityColor(notification.type)
                    } ${!notification.read ? 'ring-1 ring-primary/20' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className={`text-sm font-medium ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block" />
                              )}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Notification Type Settings */}
            <Card className="card-premium">
              <CardHeader>
                <CardTitle className="text-lg">Tipos de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-destructive" />
                      <span className="text-sm">Alertas de Seguridad</span>
                    </div>
                    <Switch 
                      checked={notificationSettings.security}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, security: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car size={16} className="text-primary" />
                      <span className="text-sm">Estado del Vehículo</span>
                    </div>
                    <Switch 
                      checked={notificationSettings.vehicle}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, vehicle: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings size={16} className="text-warning" />
                      <span className="text-sm">Notificaciones del Sistema</span>
                    </div>
                    <Switch 
                      checked={notificationSettings.system}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, system: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
};