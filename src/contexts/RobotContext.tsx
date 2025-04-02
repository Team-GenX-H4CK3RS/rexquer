import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fleetAPI, RobotDetails, MoveDirection } from "../services/api";
import { useFleet } from "./FleetContext";

const api = fleetAPI;

interface RobotContextType {
  robotDetails: RobotDetails | null;
  isLoading: boolean;
  error: string | null;
  refreshRobotDetails: () => Promise<void>;
  moveRobot: (direction: MoveDirection) => Promise<void>;
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
  const { selectedRobotId, moveRobot: moveFleetRobot } = useFleet();
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

  const moveRobot = async (direction: MoveDirection) => {
    if (!selectedRobotId) {
      setError("No robot selected for movement");
      return;
    }

    try {
      await moveFleetRobot(selectedRobotId, direction);
      // Refresh robot details to reflect the new position
      await refreshRobotDetails();
    } catch (err) {
      setError("Failed to move robot. Please try again.");
      console.error("Error moving robot:", err);
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
        moveRobot,
      }}
    >
      {children}
    </RobotContext.Provider>
  );
};
