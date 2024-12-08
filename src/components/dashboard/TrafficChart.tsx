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
    <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          Network Traffic (Real-time)
        </span>
      </h2>
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis 
              dataKey="time" 
              tickFormatter={(time) => {
                const date = new Date(time);
                return format(date, 'HH:mm:ss');
              }}
              stroke="rgba(255,255,255,0.5)"
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
            />
            <Tooltip 
              labelFormatter={(label) => {
                const date = new Date(label);
                return `Time: ${format(date, 'HH:mm:ss')}`;
              }}
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                padding: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="packets"
              stroke="#00A3FF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};