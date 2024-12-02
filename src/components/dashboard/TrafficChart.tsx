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
import { format } from "date-fns";
import { TrafficData } from "@/services/networkService";

interface TrafficChartProps {
  data: TrafficData[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  return (
    <Card className="p-6 bg-secondary">
      <h2 className="text-lg font-semibold mb-4 hover:text-primary transition-colors duration-300">Network Traffic (Real-time)</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="hover:opacity-75 transition-opacity duration-300" 
            />
            <XAxis 
              dataKey="time" 
              tickFormatter={(time) => {
                const date = new Date(time);
                return format(date, 'MM/dd HH:mm:ss');
              }}
              tick={{
                className: "hover:fill-primary transition-colors duration-300"
              }}
            />
            <YAxis 
              tick={{
                className: "hover:fill-primary transition-colors duration-300"
              }}
            />
            <Tooltip 
              labelFormatter={(label) => {
                const date = new Date(label);
                return `Date: ${format(date, 'MMM dd, yyyy')} Time: ${format(date, 'HH:mm:ss')}`;
              }}
              contentStyle={{
                backgroundColor: "#334155",
                borderColor: "#00A3FF",
                color: "#FFFFFF"
              }}
              labelStyle={{
                color: "#00A3FF",
                fontWeight: "bold",
                transition: "color 0.3s ease"
              }}
              // Removed the ":hover" property which was causing the TypeScript error
            />
            <Line
              type="monotone"
              dataKey="packets"
              stroke="#00A3FF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                className: "hover:scale-125 transition-transform duration-300",
                r: 8
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};