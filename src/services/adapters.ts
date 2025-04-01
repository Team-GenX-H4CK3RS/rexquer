import { FleetStatus, Robot, RobotDetails } from "./api";
import { SFleetStatus } from "./types";

export const adaptFleetData = (data: SFleetStatus): FleetStatus => {
  const items = Object.entries(data).map((v) => {
    return { ...v[1], name: v[0] };
  });

  return {
    active_robots: items.reduce(
      (a, c) => a + (c.status === "active" ? 1 : 0),
      0
    ),
    inactive_robots: items.reduce(
      (a, c) => a + (c.status !== "active" ? 1 : 0),
      0
    ),
    total_area_covered: undefined,
    battery_levels: items.reduce((a, c) => {
      return { ...a, [c.name]: c.battery };
    }, {}),
    robots: items.map((v) => {
      return {
        ...v,
        tasks: { current: v.task ?? "", queue: [] },
        id: v.name,
        position: { x: v.coordinates[0], y: v.coordinates[1] },
        sensors: { soil_moisture: 0, temperature: 0, crop_health: 0 },
        last_update: "",
      };
    }),
    constraints: [],
  };
};

// This adapter ensures that robot details from the API match our expected types
export const adaptRobotDetails = (data: any): RobotDetails => {
  return {
    id: data?.id ?? "",
    name: data?.name ?? "",
    status: data?.status ?? "inactive",
    battery: data?.battery ?? 0,
    position: data?.position ?? { x: 0, y: 0 },
    sensors: data?.sensors ?? {
      soil_moisture: 0,
      temperature: 0,
      crop_health: 0,
    },
    tasks: data?.tasks ?? { current: "", queue: [] },
    last_update: data?.last_update ?? new Date().toISOString(),
    coverage_area: data?.coverage_area ?? 0,
    uptime: data?.uptime ?? 0,
    maintenance_history: Array.isArray(data?.maintenance_history)
      ? data.maintenance_history
      : [],
    sensor_history: Array.isArray(data?.sensor_history)
      ? data.sensor_history
      : [],
    error_logs: Array.isArray(data?.error_logs) ? data.error_logs : undefined,
  };
};
