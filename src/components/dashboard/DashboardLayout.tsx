import { TrafficChart } from "./TrafficChart";
import { ThreatMonitoring } from "./ThreatMonitoring";
import { NetworkLogs } from "./NetworkLogs";
import { NetworkTrafficLogs } from "./NetworkTrafficLogs";
import { BlockedIPs } from "./BlockedIPs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
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
    <div className="space-y-6 animate-fade-in">      
      <TrafficChart data={trafficData} />
      
      <NetworkTrafficLogs />
      
      <ResizablePanelGroup 
        direction="vertical" 
        className="min-h-[800px] rounded-lg border border-gray-700 bg-gray-800/50 backdrop-blur-sm shadow-xl relative"
      >
        <ResizablePanel defaultSize={40}>
          <ScrollArea className="h-[400px] relative z-10">
            <div className="p-4">
              <NetworkLogs logs={networkLogs} />
            </div>
          </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-gray-700 hover:bg-primary/50 transition-colors" />
        
        <ResizablePanel defaultSize={60} className="overflow-visible">
          <ScrollArea className="h-[400px] relative z-20 overflow-visible">
            <div className="p-4 space-y-6 overflow-visible">
              <ThreatMonitoring threats={threats} onFalsePositive={onFalsePositive} />
              <BlockedIPs />
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};