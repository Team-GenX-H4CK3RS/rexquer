
import { Robot } from './api';

const mockRobots: Robot[] = [
  {
    id: 'SB001',
    name: 'AgriBot 1',
    status: 'active',
    battery: 85,
    position: { x: 120, y: 80 },
    sensors: {
      soil_moisture: 72,
      temperature: 24.5,
      crop_health: 89
    },
    tasks: {
      current: 'Soil moisture analysis in Zone B',
      queue: ['Return to charging station', 'Scheduled maintenance']
    },
    last_update: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'SB002',
    name: 'AgriBot 2',
    status: 'maintenance',
    battery: 23,
    position: { x: 220, y: 160 },
    sensors: {
      soil_moisture: 68,
      temperature: 25.2,
      crop_health: 75
    },
    tasks: {
      current: 'Maintenance mode - Sensor calibration',
      queue: []
    },
    last_update: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'SB003',
    name: 'AgriBot 3',
    status: 'active',
    battery: 92,
    position: { x: 50, y: 210 },
    sensors: {
      soil_moisture: 81,
      temperature: 23.8,
      crop_health: 93
    },
    tasks: {
      current: 'Crop health monitoring in Zone C',
      queue: ['Temperature mapping in Zone D']
    },
    last_update: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: 'SB004',
    name: 'AgriBot 4',
    status: 'charging',
    battery: 42,
    position: { x: 180, y: 30 },
    sensors: {
      soil_moisture: 75,
      temperature: 24.1,
      crop_health: 84
    },
    tasks: {
      current: 'Charging at Station 2',
      queue: ['Soil moisture analysis in Zone A']
    },
    last_update: new Date(Date.now() - 240000).toISOString()
  },
  {
    id: 'SB005',
    name: 'AgriBot 5',
    status: 'inactive',
    battery: 0,
    position: { x: 300, y: 190 },
    sensors: {
      soil_moisture: 0,
      temperature: 0,
      crop_health: 0
    },
    tasks: {
      current: 'Offline - Power failure',
      queue: []
    },
    last_update: new Date(Date.now() - 86400000).toISOString()
  }
];

class MockFleetAPI {
  private sessionId: string | null = null;

  constructor() {
    this.sessionId = 'mock-session-' + Math.random().toString(36).substring(2, 15);
    console.log('Using MOCK API with session ID:', this.sessionId);
  }

  async startSession(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.sessionId = 'mock-session-' + Math.random().toString(36).substring(2, 15);
        resolve(this.sessionId);
      }, 500);
    });
  }

  async getFleetStatus() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const battery_levels: {[key: string]: number} = {};
        mockRobots.forEach(robot => {
          battery_levels[robot.id] = robot.battery;
        });
        
        resolve({
          active_robots: mockRobots.filter(r => r.status === 'active').length,
          inactive_robots: mockRobots.filter(r => r.status !== 'active').length,
          total_area_covered: 1250,
          battery_levels,
          robots: mockRobots,
          constraints: ['Limited Communication', 'Sensor Failures & Redundancy']
        });
      }, 800);
    });
  }

  async getRobotDetails(robotId: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const robot = mockRobots.find(r => r.id === robotId);
        if (!robot) {
          reject(new Error('Robot not found'));
          return;
        }
        
        resolve({
          ...robot,
          coverage_area: Math.floor(Math.random() * 100) + 50,
          uptime: Math.floor(Math.random() * 120) + 10,
          maintenance_history: [
            {
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              issue: 'Soil moisture sensor calibration',
              resolution: 'Recalibrated and tested'
            },
            {
              date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              issue: 'Battery replacement',
              resolution: 'Installed new battery pack'
            }
          ],
          sensor_history: Array.from({ length: 10 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
            soil_moisture: Math.floor(Math.random() * 30) + 60,
            temperature: (Math.random() * 5 + 20).toFixed(1),
            crop_health: Math.floor(Math.random() * 20) + 75
          }))
        });
      }, 600);
    });
  }

  async assignTask(robotId: string, task: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const robot = mockRobots.find(r => r.id === robotId);
        if (robot) {
          robot.tasks.queue.push(task);
        }
        
        resolve({
          success: true,
          message: `Task "${task}" assigned to robot ${robotId}`
        });
      }, 700);
    });
  }
}

export const mockFleetAPI = new MockFleetAPI();
