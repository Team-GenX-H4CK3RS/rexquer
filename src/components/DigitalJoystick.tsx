import React, { useState, useEffect, useRef } from "react";

interface JoystickProps {
  onDirectionChange?: (
    direction: "forward" | "backward" | "left" | "right" | "stop"
  ) => void;
  size?: number;
  deadZone?: number;
}

const DigitalJoystick: React.FC<JoystickProps> = ({
  onDirectionChange = () => {},
  size = 200,
  deadZone = 0.1,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<
    "forward" | "backward" | "left" | "right" | "stop"
  >("stop");

  const innerSize = size * 0.4;
  const maxDistance = (size - innerSize) / 2;

  // Calculate center position
  const centerPosition = { x: 0, y: 0 };

  // Handle mouse/touch down
  const handleStart = (clientX: number, clientY: number) => {
    if (!outerRef.current) return;

    const rect = outerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setDragging(true);
    handleMove(clientX, clientY, centerX, centerY);
  };

  // Handle mouse/touch move
  const handleMove = (
    clientX: number,
    clientY: number,
    centerX?: number,
    centerY?: number
  ) => {
    if (!dragging || !outerRef.current) return;

    const rect = outerRef.current.getBoundingClientRect();
    const center = {
      x: centerX ?? rect.left + rect.width / 2,
      y: centerY ?? rect.top + rect.height / 2,
    };

    // Calculate the distance from center
    let deltaX = clientX - center.x;
    let deltaY = clientY - center.y;

    // Calculate the distance from center (Pythagorean theorem)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // If the distance is greater than maxDistance, normalize the coordinates
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    setPosition({ x: deltaX, y: deltaY });

    // Determine direction based on position
    let newDirection: "forward" | "backward" | "left" | "right" | "stop" =
      "stop";

    const absX = Math.abs(deltaX / maxDistance);
    const absY = Math.abs(deltaY / maxDistance);

    if (absX < deadZone && absY < deadZone) {
      newDirection = "stop";
    } else if (absX > absY) {
      // Horizontal movement is dominant
      newDirection = deltaX > 0 ? "right" : "left";
    } else {
      // Vertical movement is dominant
      newDirection = deltaY < 0 ? "forward" : "backward";
    }

    if (newDirection !== direction) {
      setDirection(newDirection);
      onDirectionChange(newDirection);
    }
  };

  // Handle mouse/touch up or leave
  const handleEnd = () => {
    if (dragging) {
      setDragging(false);
      setPosition(centerPosition);
      setDirection("stop");
      onDirectionChange("stop");
    }
  };

  // Set up event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [dragging]);

  // Prevent default on touch to avoid scrolling
  useEffect(() => {
    const preventDefaultTouch = (e: TouchEvent) => {
      if (dragging) e.preventDefault();
    };

    window.addEventListener("touchmove", preventDefaultTouch, {
      passive: false,
    });

    return () => {
      window.removeEventListener("touchmove", preventDefaultTouch);
    };
  }, [dragging]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={outerRef}
        className="rounded-full relative flex items-center justify-center cursor-pointer shadow-lg bg-zinc-100 border-2 border-green-600"
        style={{
          width: size,
          height: size,
          touchAction: "none",
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault(); // Prevent scrolling
          }
        }}
      >
        <div
          className="rounded-full absolute bg-green-600 shadow-md"
          style={{
            width: innerSize,
            height: innerSize,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: dragging ? "none" : "transform 0.2s ease-out",
            cursor: "grab",
            touchAction: "none",
          }}
        />
      </div>

      <div className="text-center font-bold text-lg text-green-600">
        {direction.charAt(0).toUpperCase() + direction.slice(1)}
      </div>
    </div>
  );
};

export default DigitalJoystick;
