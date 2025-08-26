import { useState } from 'react';
import { Car, Shield, User, Settings } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Security } from './Security';
import { Profile } from './Profile';
import { SettingsPanel } from './SettingsPanel';

interface TabNavigatorProps {
  onShowNotifications: () => void;
}

export const TabNavigator = ({ onShowNotifications }: TabNavigatorProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'security':
        return <Security />;
      case 'profile':
        return <Profile onShowNotifications={onShowNotifications} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Tablero', icon: Car },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="mobile-container flex flex-col h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10">
      {/* Content */}
      <div className="flex-1 overflow-y-auto mobile-scroll">
        {renderActiveComponent()}
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
                <Icon size={20} className={isActive ? 'animate-bounce-in' : ''} />
                <span className="text-xs font-medium mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};