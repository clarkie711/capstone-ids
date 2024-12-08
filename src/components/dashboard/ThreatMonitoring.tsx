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
    <div className="h-full">
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm p-4 rounded-lg">
        <Shield className="h-6 w-6 text-primary animate-pulse" />
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Active Threats
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] space-y-2 p-4">
              <p className="font-medium">Understanding Threat Detection:</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Confidence Score:</span> Indicates the likelihood (0-100%) that the detected activity is a genuine threat based on our analysis algorithms.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">False Positive:</span> An alert that was incorrectly identified as a threat. Users can mark alerts as false positives to improve detection accuracy.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-4 px-4">
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