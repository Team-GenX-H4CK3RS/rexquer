import React from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SensorReading {
  timestamp: string;
  soil_moisture: number;
  temperature: number;
  soil_ph: number;
}

interface SensorReadingsProps {
  sensorHistory: SensorReading[];
}

const SensorReadings: React.FC<SensorReadingsProps> = ({ sensorHistory }) => {
  const data = sensorHistory
    .map((reading) => ({
      ...reading,
      time: format(new Date(reading.timestamp), "HH:mm"),
      date: format(new Date(reading.timestamp), "MMM dd"),
    }))
    .reverse();

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Sensor History</h3>
      <div className="bg-card rounded-md p-4 border">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                }}
                labelFormatter={(value) => `Time: ${value}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="soil_moisture"
                name="Soil Moisture (%)"
                stroke="#1976D2"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#FF9800"
              />
              <Line
                type="monotone"
                dataKey="soil_ph"
                name="Soil pH (%)"
                stroke="#4CAF50"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SensorReadings;
