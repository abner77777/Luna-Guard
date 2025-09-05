import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from './Login';
import { AdminTabNavigator } from './AdminTabNavigator';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

export const AdminApp = () => {
  const { user, loading, profile } = useAuth();
  const { settings } = useAppSettings();
  const navigate = useNavigate();

    // Enable auto-logout with configurable settings
    useAutoLogout({
      enabled: settings.autoLogoutEnabled,
      timeoutSeconds: settings.autoLogoutTimeoutSeconds,
    });
    
  // Always call useEffect before any conditional returns
  useEffect(() => {
    if (user && profile && profile.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, profile, navigate]);

  // Only allow 'admin' role to access the admin app
  const isAuthorized = user && profile?.role === 'admin';

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message for non-admin roles
  if (user && profile && profile.role !== 'admin') {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acceso Restringido</h1>
          <p className="text-muted-foreground">Solo administradores pueden acceder a este panel.</p>
          <p className="text-sm text-muted-foreground">Si eres un usuario regular, usa la aplicación móvil estándar.</p>
          <Button 
            onClick={() => navigate('/', { replace: true })}
            className="mt-4"
          >
            Ir a la aplicación principal
          </Button>
        </div>
      </div>
    );
  }

  // Show admin panel if authorized, otherwise show login
  if (isAuthorized) {
    return (
      <>
        <AdminTabNavigator />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Login onLogin={() => {}} />
      <Toaster />
    </>
  );
};