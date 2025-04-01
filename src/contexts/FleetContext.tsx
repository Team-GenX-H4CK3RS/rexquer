
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Robot, fleetAPI, FleetStatus } from '../services/api';
import { mockFleetAPI } from '../services/mockApi';

// Set to true to use mock data, false to use the real API
const USE_MOCK_API = true;
const api = USE_MOCK_API ? mockFleetAPI : fleetAPI;

interface FleetContextType {
  isLoading: boolean;
  error: string | null;
  activeRobots: number;
  inactiveRobots: number;
  totalAreaCovered: number;
  batteryLevels: {[key: string]: number};
  robots: Robot[];
  constraints: string[];
  refreshFleetStatus: () => Promise<void>;
  selectedRobotId: string | null;
  setSelectedRobotId: (id: string | null) => void;
  assignTaskToRobot: (robotId: string, task: string) => Promise<void>;
}

const FleetContext = createContext<FleetContextType | null>(null);

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};

export const FleetProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRobots, setActiveRobots] = useState(0);
  const [inactiveRobots, setInactiveRobots] = useState(0);
  const [totalAreaCovered, setTotalAreaCovered] = useState(0);
  const [batteryLevels, setBatteryLevels] = useState<{[key: string]: number}>({});
  const [robots, setRobots] = useState<Robot[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);

  const refreshFleetStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const status: FleetStatus = await api.getFleetStatus();
      // Now we can be sure that status has all the required properties because the adapter ensures it
      setActiveRobots(status.active_robots);
      setInactiveRobots(status.inactive_robots);
      setTotalAreaCovered(status.total_area_covered);
      setBatteryLevels(status.battery_levels);
      setRobots(status.robots);
      setConstraints(status.constraints);
    } catch (err) {
      setError('Failed to fetch fleet status. Please try again.');
      console.error('Error fetching fleet status:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const assignTaskToRobot = async (robotId: string, task: string) => {
    try {
      await api.assignTask(robotId, task);
      // Refresh fleet status to get updated data
      await refreshFleetStatus();
    } catch (err) {
      console.error('Error assigning task:', err);
      throw err;
    }
  };

  useEffect(() => {
    refreshFleetStatus();
    
    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(refreshFleetStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <FleetContext.Provider
      value={{
        isLoading,
        error,
        activeRobots,
        inactiveRobots,
        totalAreaCovered,
        batteryLevels,
        robots,
        constraints,
        refreshFleetStatus,
        selectedRobotId,
        setSelectedRobotId,
        assignTaskToRobot
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};
