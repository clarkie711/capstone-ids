import { StatsOverview } from "./StatsOverview";
import { TrafficChart } from "./TrafficChart";
import { ThreatMonitoring } from "./ThreatMonitoring";
import { NetworkLogs } from "./NetworkLogs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { NetworkThreat, NetworkLog } from "@/types/network";

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
    <div className="space-y-6 animate-fade-in">
      <StatsOverview
        activeConnections={activeConnections}
        recentAlertsCount={recentAlertsCount}
        blockedIPs={blockedIPs}
      />
      
      <TrafficChart data={trafficData} />
      
      <ResizablePanelGroup 
        direction="vertical" 
        className="min-h-[800px] rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl"
      >
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <NetworkLogs logs={networkLogs} />
            </div>
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-gray-700 hover:bg-primary/50 transition-colors" />
        
        <ResizablePanel defaultSize={50}>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <ThreatMonitoring threats={threats} onFalsePositive={onFalsePositive} />
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};