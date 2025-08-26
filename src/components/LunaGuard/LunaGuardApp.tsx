import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from './Login';
import { TabNavigator } from './TabNavigator';
import { Notifications } from './Notifications';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

export const LunaGuardApp = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();

  // Always call useEffect hooks before any conditional returns
  useEffect(() => {
    if (user && profile && profile.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, profile, navigate]);

  // Only allow 'user' role to access the mobile app
  const isAuthorized = user && profile?.role === 'user';

  const handleLogin = () => {
    // Login is handled by useAuth hook
  };

  const handleShowNotifications = () => {
    setShowNotifications(true);
  };

  const handleBackFromNotifications = () => {
    setShowNotifications(false);
  };

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized access message for other non-user roles  
  if (user && profile && profile.role !== 'user') {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10 p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Acceso Restringido</h1>
          <p className="text-muted-foreground">Esta aplicación móvil es solo para usuarios regulares.</p>
        </div>
      </div>
    );
  }

  // Show notifications screen
  if (showNotifications) {
    return <Notifications onBack={handleBackFromNotifications} />;
  }

  // Show main app if authorized, otherwise show login
  if (isAuthorized) {
    return (
      <>
        <TabNavigator onShowNotifications={handleShowNotifications} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Login onLogin={handleLogin} />
      <Toaster />
    </>
  );
};