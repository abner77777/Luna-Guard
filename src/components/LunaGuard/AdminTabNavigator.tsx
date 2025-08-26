import { useState } from 'react';
import { BarChart3, Users, Car, Search, Settings } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminVehicles } from './AdminVehicles';
import { AdminSearch } from './AdminSearch';
import { AdminSettings } from './AdminSettings';

type AdminTab = 'dashboard' | 'users' | 'vehicles' | 'search' | 'settings';

export const AdminTabNavigator = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as const, label: 'Usuarios', icon: Users },
    { id: 'vehicles' as const, label: 'Vehículos', icon: Car },
    { id: 'search' as const, label: 'Búsqueda', icon: Search },
    { id: 'settings' as const, label: 'Config', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'vehicles':
        return <AdminVehicles />;
      case 'search':
        return <AdminSearch />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="mobile-container flex flex-col h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">Panel Admin</h1>
          <div className="w-3 h-3 rounded-full bg-success animate-pulse-glow" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto mobile-scroll">
        {renderContent()}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-card/90 backdrop-blur-sm border-t border-border/50 px-2 py-2 flex-shrink-0">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};