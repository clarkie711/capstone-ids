import { NetworkThreat } from "@/services/networkService";
import { ThreatCard } from "./ThreatCard";
import { HelpCircle } from "lucide-react";
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
      <div className="flex items-center gap-2 mb-4 sticky top-0">
        <h2 className="text-lg font-semibold">Active Threats</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
      <div className="space-y-4">
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