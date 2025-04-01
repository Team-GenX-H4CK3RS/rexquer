
import { FleetStatus, Robot, RobotDetails } from './api';

// This adapter ensures that the fleet data from the API matches our expected types
export const adaptFleetData = (data: any): FleetStatus => {
  // Provide default values for any missing fields
  return {
    active_robots: data?.active_robots ?? 0,
    inactive_robots: data?.inactive_robots ?? 0,
    total_area_covered: data?.total_area_covered ?? 0,
    battery_levels: data?.battery_levels ?? {},
    robots: Array.isArray(data?.robots) ? data.robots : [],
    constraints: Array.isArray(data?.constraints) ? data.constraints : [],
  };
};

// This adapter ensures that robot details from the API match our expected types
export const adaptRobotDetails = (data: any): RobotDetails => {
  return {
    id: data?.id ?? '',
    name: data?.name ?? '',
    status: data?.status ?? 'inactive',
    battery: data?.battery ?? 0,
    position: data?.position ?? { x: 0, y: 0 },
    sensors: data?.sensors ?? { soil_moisture: 0, temperature: 0, crop_health: 0 },
    tasks: data?.tasks ?? { current: '', queue: [] },
    last_update: data?.last_update ?? new Date().toISOString(),
    coverage_area: data?.coverage_area ?? 0,
    uptime: data?.uptime ?? 0,
    maintenance_history: Array.isArray(data?.maintenance_history) ? data.maintenance_history : [],
    sensor_history: Array.isArray(data?.sensor_history) ? data.sensor_history : [],
    error_logs: Array.isArray(data?.error_logs) ? data.error_logs : undefined,
  };
};
