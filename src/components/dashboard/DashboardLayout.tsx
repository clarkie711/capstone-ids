import { TrafficChart } from "./TrafficChart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SnortAlerts } from "./SnortAlerts";

interface DashboardLayoutProps {
  trafficData: any[];
}

export const DashboardLayout = ({
  trafficData,
}: DashboardLayoutProps) => {
  return (
    <div className="space-y-8 animate-fade-in">      
      <TrafficChart data={trafficData} />
      
      <div className="space-y-8">
        {/* Snort Alerts Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl p-4">
          <ScrollArea className="h-[600px]">
            <SnortAlerts />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};