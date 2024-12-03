import { StatsOverview } from "./StatsOverview";
import { TrafficChart } from "./TrafficChart";
import { ThreatMonitoring } from "./ThreatMonitoring";
import { NetworkLogs } from "./NetworkLogs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { NetworkThreat, NetworkLog } from "@/services/networkService";

interface DashboardLayoutProps {
  activeConnections: number;
  recentAlertsCount: number;
  blockedIPs: number;
  trafficData: any[];
  threats: NetworkThreat[];
  networkLogs: NetworkLog[];
  onFalsePositive: (threatId: number) => void;
}

export const DashboardLayout = ({
  activeConnections,
  recentAlertsCount,
  blockedIPs,
  trafficData,
  threats,
  networkLogs,
  onFalsePositive,
}: DashboardLayoutProps) => {
  return (
    <div className="space-y-6">
      <StatsOverview
        activeConnections={activeConnections}
        recentAlertsCount={recentAlertsCount}
        blockedIPs={blockedIPs}
      />
      
      <TrafficChart data={trafficData} />
      
      <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <ThreatMonitoring threats={threats} onFalsePositive={onFalsePositive} />
            </div>
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <NetworkLogs logs={networkLogs} />
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};