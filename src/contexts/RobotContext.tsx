
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fleetAPI } from '../services/api';
import { mockFleetAPI } from '../services/mockApi';
import { useFleet } from './FleetContext';

// Set to true to use mock data, false to use the real API
const USE_MOCK_API = true;
const api = USE_MOCK_API ? mockFleetAPI : fleetAPI;

interface RobotDetails {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'charging' | 'maintenance';
  battery: number;
  position: {
    x: number;
    y: number;
  };
  sensors: {
    soil_moisture: number;
    temperature: number;
    crop_health: number;
  };
  tasks: {
    current: string;
    queue: string[];
  };
  last_update: string;
  coverage_area: number;
  uptime: number;
  maintenance_history: {
    date: string;
    issue: string;
    resolution: string;
  }[];
  sensor_history: {
    timestamp: string;
    soil_moisture: number;
    temperature: number;
    crop_health: number;
  }[];
  error_logs?: string[];
}

interface RobotContextType {
  robotDetails: RobotDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshRobotDetails: () => Promise<void>;
}

const RobotContext = createContext<RobotContextType | null>(null);

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};

export const RobotProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { selectedRobotId } = useFleet();
  const [robotDetails, setRobotDetails] = useState<RobotDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRobotDetails = async () => {
    if (!selectedRobotId) {
      setRobotDetails(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const details = await api.getRobotDetails(selectedRobotId);
      setRobotDetails(details);
    } catch (err) {
      setError('Failed to fetch robot details. Please try again.');
      console.error('Error fetching robot details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRobotDetails();
  }, [selectedRobotId]);

  return (
    <RobotContext.Provider
      value={{
        robotDetails,
        isLoading,
        error,
        refreshRobotDetails
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};
