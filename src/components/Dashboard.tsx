import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle } from "lucide-react";
import FleetMap from "./FleetMap";
import RobotList from "./RobotList";
import RobotDetailPanel from "./RobotDetailPanel";
import {
  Robot,
  fleetAPI as api,
  FleetStatus,
  MoveDirection,
} from "../services/api";

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRobots, setActiveRobots] = useState(0);
  const [inactiveRobots, setInactiveRobots] = useState(0);
  const [totalAreaCovered, setTotalAreaCovered] = useState(0);
  const [batteryLevels, setBatteryLevels] = useState<{ [key: string]: number }>(
    {}
  );
  const [robots, setRobots] = useState<Robot[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);

  const { toast } = useToast();
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
      setError("Failed to fetch fleet status. Please try again.");
      console.error("Error fetching fleet status:", err);
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
      console.error("Error assigning task:", err);
      throw err;
    }
  };

  const moveRobot = async (robotId: string, direction: MoveDirection) => {
    try {
      await api.moveRobot(robotId, direction);
    } catch (err) {
      console.error("Error moving robot:", err);
      throw err;
    }
  };

  useEffect(() => {
    refreshFleetStatus();
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshFleetStatus();
      toast({
        title: "Fleet data refreshed",
        description: "The latest fleet status has been loaded.",
      });
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh fleet data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate average battery level
  const avgBattery =
    robots.length > 0
      ? Math.round(
          robots.reduce((sum, robot) => sum + robot.battery, 0) / robots.length
        )
      : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Agricultural Fleet Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and control your autonomous SLAM-enabled robots
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex gap-2 items-center"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Robots</CardTitle>
              <CardDescription>Currently operational</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-agri-green">
                {activeRobots}
              </div>
              <div className="text-sm text-muted-foreground">
                {inactiveRobots} inactive
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Area Covered</CardTitle>
              <CardDescription>Total monitoring area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-agri-blue">
                {totalAreaCovered}
              </div>
              <div className="text-sm text-muted-foreground">Square meters</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Average Battery</CardTitle>
              <CardDescription>Fleet power status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                <span
                  className={
                    avgBattery > 70
                      ? "text-agri-green"
                      : avgBattery > 30
                      ? "text-agri-orange"
                      : "text-agri-red"
                  }
                >
                  {avgBattery}%
                </span>
              </div>
              <Progress value={avgBattery} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Fleet Map</CardTitle>
                <CardDescription>
                  Real-time positions and status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <FleetMap
                  robots={robots}
                  onRobotSelected={setSelectedRobotId}
                />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Robots</CardTitle>
                <CardDescription>Status and quick access</CardDescription>
              </CardHeader>
              <CardContent>
                <RobotList
                  robots={robots}
                  selectedRobotId={selectedRobotId}
                  setSelectedRobotId={setSelectedRobotId}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedRobotId && (
          <Card>
            <CardHeader>
              <CardTitle>Robot Details</CardTitle>
              <CardDescription>
                Detailed information and controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RobotDetailPanel
                selectedRobotId={selectedRobotId}
                assignTaskToRobot={assignTaskToRobot}
                setSelectedRobotId={setSelectedRobotId}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
