
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fleetAPI, RobotDetails } from '../services/api';
import { mockFleetAPI } from '../services/mockApi';
import { useFleet } from './FleetContext';

// Set to true to use mock data, false to use the real API
const USE_MOCK_API = true;
const api = USE_MOCK_API ? mockFleetAPI : fleetAPI;

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
      const details: RobotDetails = await api.getRobotDetails(selectedRobotId);
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
