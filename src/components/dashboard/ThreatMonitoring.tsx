import { NetworkThreat } from "@/types/network";
import { ThreatCard } from "./ThreatCard";
import { Shield, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThreatMonitoringProps {
  threats: NetworkThreat[];
  onFalsePositive: (threatId: number) => void;
}

export const ThreatMonitoring = ({ threats, onFalsePositive }: ThreatMonitoringProps) => {
  return (
    <div className="h-full relative z-30">
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm p-4 rounded-lg z-40">
        <Shield className="h-6 w-6 text-primary animate-pulse" />
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Active Threats
          </h2>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="right"
              className="max-w-[300px] space-y-2 p-4 bg-gray-900/95 border border-gray-700/50 backdrop-blur-sm shadow-xl z-50"
            >
              <p className="font-medium text-primary">Understanding Threat Detection:</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Confidence Score:</span> Indicates the likelihood (0-100%) that the detected activity is a genuine threat based on our analysis algorithms.
                </p>
                <p>
                  <span className="font-medium text-foreground">False Positive:</span> An alert that was incorrectly identified as a threat. Users can mark alerts as false positives to improve detection accuracy.
                </p>
                <p>
                  <span className="font-medium text-foreground">Block IP:</span> Immediately blocks the source IP address from accessing the network.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-4 px-4 relative z-30">
        {threats
          .filter(threat => !threat.is_false_positive)
          .map((threat) => (
            <ThreatCard
              key={threat.id}
              threat={threat}
              onFalsePositive={onFalsePositive}
            />
          ))}
      </div>
    </div>
  );
};