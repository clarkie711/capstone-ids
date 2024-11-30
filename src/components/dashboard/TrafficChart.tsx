import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { TrafficData } from "@/services/networkService";

interface TrafficChartProps {
  data: TrafficData[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  const [ntpOffset, setNtpOffset] = useState<number>(0);
  const [chartData, setChartData] = useState<TrafficData[]>(data);

  // Synchronize with NTP server and calculate offset
  useEffect(() => {
    const syncWithNTP = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const endTime = Date.now();
        const roundTripTime = endTime - startTime;
        
        if (response.ok) {
          const data = await response.json();
          const serverTime = new Date(data.datetime).getTime();
          const clientTime = Date.now();
          
          // Calculate offset considering network latency
          const offset = serverTime - (clientTime - roundTripTime / 2);
          setNtpOffset(offset);
        }
      } catch (error) {
        console.error('Failed to sync with NTP:', error);
      }
    };

    syncWithNTP();
    const intervalId = setInterval(syncWithNTP, 300000); // Resync every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  // Update chart data with correct timestamps
  useEffect(() => {
    const adjustedData = data.map(item => ({
      ...item,
      time: new Date(new Date(item.time).getTime() + ntpOffset).toISOString(),
    }));
    setChartData(adjustedData);
  }, [data, ntpOffset]);

  return (
    <Card className="p-6 bg-secondary">
      <h2 className="text-lg font-semibold mb-4">Network Traffic (Real-time)</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(time) => {
                const date = new Date(time);
                return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
              }}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => {
                const date = new Date(label);
                return `Time: ${date.toLocaleTimeString()}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="packets"
              stroke="#00A3FF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};