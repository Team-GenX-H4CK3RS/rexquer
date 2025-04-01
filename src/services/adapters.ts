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
        sensors: { soil_moisture: 0, temperature: 0, soil_ph: 0 },
        last_update: "",
      };
    }),
    constraints: [],
  };
};

// This adapter ensures that robot details from the API match our expected types
export const adaptRobotDetails = (data: any): RobotDetails => {
  console.log(data);

  return {
    id: data?.rover_id ?? "",
    name: data?.name ?? "",
    status: data?.status ?? "inactive",
    battery: data?.battery_level ?? 0,
    position: { x: data.coordinates[0], y: data.coordinates[1] },
    sensors: {
      soil_moisture: data.soil_moisture,
      temperature: data.temperature,
      soil_ph: data.soil_pH,
    },
    tasks: { current: data.task ?? "", queue: [] },
    last_update: (data.timestamp
      ? new Date(data.timestamp)
      : new Date()
    ).toISOString(),
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
