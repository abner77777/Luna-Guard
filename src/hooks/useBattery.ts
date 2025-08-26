import { useState, useEffect } from 'react';

interface BatteryInfo {
  level: number; // 0-1
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  supported: boolean;
}

// Extend Navigator interface to include getBattery
declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
}

export const useBattery = () => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: 0,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    supported: false,
  });

  useEffect(() => {
    const initBattery = async () => {
      if (!navigator.getBattery) {
        // Battery API not supported
        setBatteryInfo(prev => ({ ...prev, supported: false }));
        return;
      }

      try {
        const battery = await navigator.getBattery();
        
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            supported: true,
          });
        };

        // Initial update
        updateBatteryInfo();

        // Add event listeners for battery changes
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('chargingtimechange', updateBatteryInfo);
        battery.addEventListener('dischargingtimechange', updateBatteryInfo);

        // Cleanup function
        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
          battery.removeEventListener('chargingtimechange', updateBatteryInfo);
          battery.removeEventListener('dischargingtimechange', updateBatteryInfo);
        };
      } catch (error) {
        console.warn('Battery API not available:', error);
        setBatteryInfo(prev => ({ ...prev, supported: false }));
      }
    };

    initBattery();
  }, []);

  return batteryInfo;
};