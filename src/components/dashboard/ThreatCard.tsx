import { ChevronDown, ChevronUp } from "lucide-react";
import { NetworkThreat } from "@/types/network";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThreatHeader } from "./ThreatHeader";
import { ThreatActions } from "./ThreatActions";
import { ThreatDetails } from "./ThreatDetails";

interface ThreatCardProps {
  threat: NetworkThreat;
  onFalsePositive: (threatId: number) => void;
}

export const ThreatCard = ({ threat, onFalsePositive }: ThreatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "group flex flex-col rounded-xl overflow-hidden border border-gray-800/50",
      "bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm",
      "transition-all duration-300 hover:border-gray-700/80 hover:from-gray-900/70 hover:to-gray-800/50",
      "animate-fade-in shadow-lg hover:shadow-xl"
    )}>
      <div className="flex items-center justify-between p-4">
        <ThreatHeader threat={threat} />
        
        <div className="flex items-center">
          <ThreatActions
            threatId={threat.id}
            sourceIp={threat.source_ip}
            threatType={threat.threat_type}
            confidenceScore={threat.confidence_score}
            onFalsePositive={onFalsePositive}
          />
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-primary transition-colors ml-3"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-800/50 animate-accordion-down">
          <ThreatDetails threat={threat} />
        </div>
      )}
    </div>
  );
};