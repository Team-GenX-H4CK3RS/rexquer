import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fleetAPI as api, RobotDetails, MoveDirection } from "../services/api";
import {
  RefreshCw,
  Battery,
  MapPin,
  AlertTriangle,
  Clock,
  Activity,
  Thermometer,
  Droplets,
  Heart,
  BatteryCharging,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import TaskQueueDisplay from "./TaskQueueDisplay";
import SensorReadings from "./SensorReadings";
import DigitalJoystick from "./DigitalJoystick";

const RobotDetailPanel = ({
  selectedRobotId,
  assignTaskToRobot,
  setSelectedRobotId,
}: {
  selectedRobotId: string;
  assignTaskToRobot: any;
  setSelectedRobotId: any;
}) => {
  const [robotDetails, setRobotDetails] = useState<RobotDetails | null>(null);
  const [newTask, setNewTask] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      await api.moveRobot(selectedRobotId, direction);
      // Refresh robot details to reflect the new position
      await refreshRobotDetails();
    } catch (err) {
      setError("Failed to move robot. Please try again.");
      console.error("Error moving robot:", err);
    }
  };

  const handleRefresh = async () => {
    await refreshRobotDetails();
  };

  const handleClosePanel = () => {
    setSelectedRobotId(null);
  };

  const handleAssignTask = async () => {
    if (!robotDetails || !newTask.trim()) return;

    setIsAssigning(true);
    try {
      await assignTaskToRobot(robotDetails.id, newTask);
      toast({
        title: "Task assigned",
        description: `Successfully assigned task to ${robotDetails.name}`,
      });
      setNewTask("");
    } catch (err) {
      toast({
        title: "Failed to assign task",
        description: "There was an error assigning the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    refreshRobotDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (error || !robotDetails) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error || "Failed to load robot details"}
        </AlertDescription>
      </Alert>
    );
  }

  const getBatteryColor = (level: number) => {
    if (level < 20) return "text-agri-red";
    if (level < 50) return "text-agri-orange";
    return "text-agri-green";
  };

  const getLastUpdateText = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };
  return (
    <div>
      <DigitalJoystick
        onDirectionChange={async (e) => await moveRobot(e)}
        size={250}
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{robotDetails.name}</h2>
            <Badge
              variant={robotDetails.status === "active" ? "default" : "outline"}
            >
              {robotDetails.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">ID: {robotDetails.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClosePanel}>
            <X size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-md">
          <Battery className={`${getBatteryColor(robotDetails.battery)}`} />
          <div>
            <div className="text-sm font-medium">Battery</div>
            <div
              className={`text-lg font-bold ${getBatteryColor(
                robotDetails.battery
              )}`}
            >
              {robotDetails.battery}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/20 p-3 rounded-md">
          <MapPin className="text-agri-blue" />
          <div>
            <div className="text-sm font-medium">Location</div>
            <div className="text-lg font-bold">
              X: {robotDetails.position.x}, Y: {robotDetails.position.y}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sensors">
        <TabsList className="mb-4">
          <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Current Readings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="sensor-badge bg-muted/20 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="text-agri-blue" />
                  <span className="font-medium">Soil Moisture</span>
                </div>
                <div className="text-2xl font-bold text-agri-blue">
                  {robotDetails.sensors.soil_moisture}%
                </div>
                <Progress
                  value={robotDetails.sensors.soil_moisture}
                  className="mt-2"
                />
              </div>

              <div className="sensor-badge bg-muted/20 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="text-agri-orange" />
                  <span className="font-medium">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-agri-orange">
                  {robotDetails.sensors.temperature}°C
                </div>
                <Progress
                  value={robotDetails.sensors.temperature * 2}
                  className="mt-2"
                />
              </div>

              <div className="sensor-badge bg-muted/20 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-agri-green" />
                  <span className="font-medium">Soil pH</span>
                </div>
                <div className="text-2xl font-bold text-agri-green">
                  {robotDetails.sensors.soil_ph}
                </div>
                <Progress
                  value={robotDetails.sensors.soil_ph}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <SensorReadings sensorHistory={robotDetails.sensor_history} />
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Current Task</h3>
              <div className="bg-muted/20 p-4 rounded-md">
                <p className="font-medium">{robotDetails.tasks.current}</p>
              </div>
            </div>

            <TaskQueueDisplay tasks={robotDetails.tasks.queue} />

            <div>
              <h3 className="text-lg font-medium mb-3">Assign New Task</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter task description"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button onClick={handleAssignTask}>
                  {isAssigning ? "Assigning..." : "Assign"}
                </Button>
              </div>
              {robotDetails.status !== "active" &&
                robotDetails.status !== "charging" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Cannot assign tasks to robots that are inactive or in
                    maintenance.
                  </p>
                )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RobotDetailPanel;
