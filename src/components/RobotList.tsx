
import React from 'react';
import { useFleet } from '../contexts/FleetContext';
import { Robot } from '../services/api';
import { Badge } from "@/components/ui/badge";
import { Battery, AlertTriangle, Zap, Tool, Pause } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RobotListProps {
  robots: Robot[];
}

const RobotList: React.FC<RobotListProps> = ({ robots }) => {
  const { selectedRobotId, setSelectedRobotId } = useFleet();

  const getRobotStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap size={16} className="text-agri-green" />;
      case 'inactive':
        return <Pause size={16} className="text-gray-500" />;
      case 'charging':
        return <Battery size={16} className="text-agri-blue" />;
      case 'maintenance':
        return <Tool size={16} className="text-agri-yellow" />;
      default:
        return <AlertTriangle size={16} className="text-agri-red" />;
    }
  };

  const getBatteryClassName = (level: number) => {
    if (level < 20) return "battery-low";
    if (level < 50) return "battery-medium";
    return "battery-high";
  };

  const getLastUpdateText = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <div className="flex flex-col space-y-3 max-h-[350px] overflow-y-auto pr-2">
      {robots.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No robots available
        </div>
      ) : (
        robots.map((robot) => (
          <div
            key={robot.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedRobotId === robot.id 
                ? 'bg-primary/10 border-primary' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedRobotId(robot.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getRobotStatusIcon(robot.status)}
                <span className="font-medium">{robot.name}</span>
              </div>
              <Badge variant={robot.status === 'active' ? 'default' : 'outline'}>
                {robot.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <div className={getBatteryClassName(robot.battery)}>
                  {robot.battery}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {getLastUpdateText(robot.last_update)}
              </div>
            </div>
            
            <div className="mt-2 text-xs truncate text-muted-foreground">
              {robot.tasks.current}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RobotList;
