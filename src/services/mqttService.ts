interface DeviceState {
  isLocked: boolean;
  hasPower: boolean;
  panic: boolean;
  lastUpdate: string;
  lastCommand?: string;
}

interface MqttResponse {
  status: string;
  command?: string;
}

const MQTT_BASE_URL = 'https://mqtt-broker-service-nine.vercel.app';

export class MqttService {
  
  static async getDeviceStatus(): Promise<DeviceState | null> {
    try {
      const response = await fetch(`${MQTT_BASE_URL}/device/status`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      console.error('Failed to get device status:', response.status);
      return null;
    } catch (error) {
      console.error('Error getting device status:', error);
      return null;
    }
  }

  static async sendCommand(command: 'lock' | 'unlock' | 'disconnect' | 'reconnect' | 'panic' | 'no-panic'): Promise<boolean> {
    try {
      const response = await fetch(`${MQTT_BASE_URL}/device/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        const result: MqttResponse = await response.json();
        console.log('Command sent successfully:', result);
        return result.status === 'sent';
      }

      console.error('Failed to send command:', response.status);
      return false;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }

  static async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${MQTT_BASE_URL}/health`, {
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking server health:', error);
      return false;
    }
  }
}