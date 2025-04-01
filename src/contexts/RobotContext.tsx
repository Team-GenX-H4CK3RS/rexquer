import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fleetAPI, RobotDetails } from "../services/api";
import { useFleet } from "./FleetContext";

const api = fleetAPI;

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
    throw new Error("useRobot must be used within a RobotProvider");
  }
  return context;
};

export const RobotProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
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
      // Now we can be sure that details has all the required properties because the adapter ensures it
      setRobotDetails(details);
    } catch (err) {
      setError("Failed to fetch robot details. Please try again.");
      console.error("Error fetching robot details:", err);
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
        refreshRobotDetails,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};
