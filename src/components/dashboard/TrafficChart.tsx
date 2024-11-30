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
  const [chartData, setChartData] = useState<TrafficData[]>(data);

  // Update chart data with server timestamps
  useEffect(() => {
    // Use the data directly since Supabase already provides server timestamps
    setChartData(data);
  }, [data]);

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