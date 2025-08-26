import { Users, Car, Activity, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminVehicles } from '@/hooks/useAdminVehicles';
import { useAuth } from '@/hooks/useAuth';
import { useSyncManager } from '@/hooks/useSyncManager';

export const AdminDashboard = () => {
  const { stats, loading, fetchStats } = useAdminStats();
  const { fetchVehicles } = useAdminVehicles();
  const { profile } = useAuth();

  // Sync manager for admin data
  const { isRefreshing, manualSync, getTimeSinceLastSync } = useSyncManager({
    onSync: async () => {
      await Promise.all([
        fetchStats(),
        fetchVehicles(),
      ]);
    },
    interval: 60 * 60 * 1000, // 1 hour
    enablePullToRefresh: true,
  });

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const currentTime = new Date();
  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <div className="p-4 space-y-4 h-full mobile-scroll">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {greeting()}, {profile?.first_name || 'Admin'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Última sincronización: {getTimeSinceLastSync()}
            </p>
          </div>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Users Stats */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="text-primary mr-2" size={20} />
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp size={12} className="text-success" />
                <span className="text-success">{stats.activeUsers} activos</span>
              </div>
              {stats.inactiveUsers > 0 && (
                <div className="flex items-center space-x-2 text-xs">
                  <TrendingDown size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{stats.inactiveUsers} inactivos</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Stats */}
        <Card className="card-premium">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Car className="text-primary mr-2" size={20} />
            <CardTitle className="text-sm font-medium">Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">{stats.totalVehicles}</div>
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp size={12} className="text-success" />
                <span className="text-success">{stats.activeVehicles} activos</span>
              </div>
              {stats.inactiveVehicles > 0 && (
                <div className="flex items-center space-x-2 text-xs">
                  <TrendingDown size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{stats.inactiveVehicles} inactivos</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{stats.totalUsers + stats.totalVehicles}</div>
              <div className="text-xs text-muted-foreground">Total Registros</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-success">
                {stats.totalVehicles > 0 ? (stats.totalVehicles / Math.max(stats.totalUsers, 1)).toFixed(1) : '0'}
              </div>
              <div className="text-xs text-muted-foreground">Vehículos/Usuario</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="card-premium">
        <CardHeader className="flex flex-row items-center space-y-0">
          <Activity className="text-primary mr-2" size={20} />
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">No hay actividades recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type.includes('user') ? (
                      <Users size={16} className="text-primary" />
                    ) : (
                      <Car size={16} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.description}
                    </p>
                    {activity.user_name && (
                      <p className="text-xs text-muted-foreground">{activity.user_name}</p>
                    )}
                    {activity.vehicle_info && (
                      <p className="text-xs text-muted-foreground">{activity.vehicle_info}</p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock size={12} className="mr-1" />
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
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