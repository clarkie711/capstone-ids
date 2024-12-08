import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { TrafficData } from "@/services/networkService";

interface TrafficChartProps {
  data: TrafficData[];
}

export const TrafficChart = ({ data }: TrafficChartProps) => {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    console.log('Manually refreshing traffic data...');
    queryClient.invalidateQueries({ queryKey: ['trafficData'] });
  };

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Network Traffic (Real-time)
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
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