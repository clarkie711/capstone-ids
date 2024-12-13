import { TrafficChart } from "./TrafficChart";
import { ThreatMonitoring } from "./ThreatMonitoring";
import { NetworkLogs } from "./NetworkLogs";
import { NetworkTrafficLogs } from "./NetworkTrafficLogs";
import { BlockedIPs } from "./BlockedIPs";
import { SnortAlerts } from "./SnortAlerts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NetworkThreat, NetworkLog } from "@/types/network";

interface DashboardLayoutProps {
  trafficData: any[];
  threats: NetworkThreat[];
  networkLogs: NetworkLog[];
  onFalsePositive: (threatId: number) => void;
}

export const DashboardLayout = ({
  trafficData,
  threats,
  networkLogs,
  onFalsePositive,
}: DashboardLayoutProps) => {
  return (
    <div className="space-y-8 animate-fade-in">      
      <TrafficChart data={trafficData} />
      
      <NetworkTrafficLogs />
      
      <div className="space-y-8">
        {/* Snort Alerts Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl p-4">
          <ScrollArea className="h-[600px]">
            <SnortAlerts />
          </ScrollArea>
        </div>

        {/* Network Logs Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl p-4">
          <ScrollArea className="h-[500px]">
            <NetworkLogs logs={networkLogs} />
          </ScrollArea>
        </div>

        {/* Active Threats Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl p-4">
          <ScrollArea className="h-[500px]">
            <ThreatMonitoring threats={threats} onFalsePositive={onFalsePositive} />
          </ScrollArea>
        </div>

        {/* Blocked IPs Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl p-4">
          <ScrollArea className="h-[400px]">
            <BlockedIPs />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};