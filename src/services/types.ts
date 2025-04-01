export type SFleetStatusItem = {
  battery: number;
  coordinates: number[];
  status: string;
  task: undefined;
};

export type SFleetStatus = Record<string, SFleetStatusItem>;
