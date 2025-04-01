
import React, { useState, useEffect } from 'react';
import { useFleet } from '../contexts/FleetContext';
import { Robot } from '../services/api';
import { Battery, Thermometer, Droplets, Heart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FleetMapProps {
  robots: Robot[];
}

const statusColors = {
  active: '#4CAF50',  // Green
  inactive: '#9E9E9E', // Gray
  charging: '#2196F3',  // Blue
  maintenance: '#FFC107' // Yellow
};

const FleetMap: React.FC<FleetMapProps> = ({ robots }) => {
  const { setSelectedRobotId, selectedRobotId } = useFleet();
  const [mapDimensions, setMapDimensions] = useState({ width: 600, height: 400 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef) return;

    const updateDimensions = () => {
      if (containerRef) {
        setMapDimensions({
          width: containerRef.clientWidth,
          height: containerRef.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef]);

  // Apply a simple scaling to fit the robot positions within the map container
  const scalePosition = (pos: { x: number, y: number }) => {
    const maxX = Math.max(...robots.map(robot => robot.position.x), 350);
    const maxY = Math.max(...robots.map(robot => robot.position.y), 250);
    
    const padding = 30; // Padding to avoid robots being placed at the very edge
    
    const scaledX = (pos.x / maxX) * (mapDimensions.width - padding * 2) + padding;
    const scaledY = (pos.y / maxY) * (mapDimensions.height - padding * 2) + padding;
    
    return { x: scaledX, y: scaledY };
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden rounded-md bg-muted/20 map-container border"
      ref={setContainerRef}
    >
      {/* Charging stations */}
      <div 
        className="absolute w-12 h-12 bg-agri-blue/10 border-2 border-agri-blue rounded-full flex items-center justify-center"
        style={{ 
          top: mapDimensions.height * 0.2, 
          left: mapDimensions.width * 0.1 
        }}
      >
        <div className="text-xs font-medium text-agri-blue">Station 1</div>
      </div>
      
      <div 
        className="absolute w-12 h-12 bg-agri-blue/10 border-2 border-agri-blue rounded-full flex items-center justify-center"
        style={{ 
          top: mapDimensions.height * 0.7, 
          left: mapDimensions.width * 0.8 
        }}
      >
        <div className="text-xs font-medium text-agri-blue">Station 2</div>
      </div>

      {/* Robots markers */}
      {robots.map((robot) => {
        const position = scalePosition(robot.position);
        const isSelected = robot.id === selectedRobotId;
        
        return (
          <TooltipProvider key={robot.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`robot-marker absolute cursor-pointer ${isSelected ? 'z-10' : ''}`}
                  style={{
                    top: position.y,
                    left: position.x,
                    transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : ''}`,
                  }}
                  onClick={() => setSelectedRobotId(robot.id)}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isSelected ? 'shadow-lg' : ''}`}
                    style={{ 
                      backgroundColor: `${statusColors[robot.status]}20`,
                      borderColor: statusColors[robot.status]
                    }}
                  >
                    <div 
                      className="text-xs font-bold"
                      style={{ color: statusColors[robot.status] }}
                    >
                      {robot.id}
                    </div>
                  </div>
                  
                  {/* Sensor indicators for active robots */}
                  {robot.status === 'active' && (
                    <div className="absolute flex gap-1 -bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 rounded-full bg-agri-blue animate-pulse-slow"></div>
                      <div className="w-2 h-2 rounded-full bg-agri-green animate-pulse-slow"></div>
                      <div className="w-2 h-2 rounded-full bg-agri-orange animate-pulse-slow"></div>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{robot.name} ({robot.id})</div>
                  <div>Status: {robot.status}</div>
                  <div className="flex items-center gap-1">
                    <Battery size={14} /> {robot.battery}%
                  </div>
                  {robot.status === 'active' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Droplets size={12} className="text-agri-blue" /> {robot.sensors.soil_moisture}%
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Thermometer size={12} className="text-agri-orange" /> {robot.sensors.temperature}°C
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Heart size={12} className="text-agri-green" /> {robot.sensors.crop_health}%
                      </div>
                    </div>
                  )}
                  <div className="text-xs mt-1">{robot.tasks.current}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default FleetMap;
