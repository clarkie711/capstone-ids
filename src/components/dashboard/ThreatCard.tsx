import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { NetworkThreat } from "@/types/network";
import { LocationDetails } from "./LocationDetails";
import { useState } from "react";

interface ThreatCardProps {
  threat: NetworkThreat;
  onFalsePositive: (threatId: number) => void;
}

export const ThreatCard = ({ threat, onFalsePositive }: ThreatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScenarioDescription = (threat: NetworkThreat) => {
    const details = threat.details || {};
    switch (threat.threat_type) {
      case 'Port Scan (Educational)':
        return `Network scanning activity detected: ${details.ports_scanned} ports scanned using ${details.scan_type} method`;
      case 'Unusual Traffic Pattern':
        return `Unusual bandwidth usage detected: ${details.bandwidth_usage} over ${details.duration}`;
      case 'Authentication Attempt':
        return `Multiple authentication events: ${details.attempts} attempts over ${details.interval} interval`;
      default:
        return `Network activity detected with unusual patterns`;
    }
  };

  return (
    <div className="flex flex-col bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70">
      <div className="flex items-center justify-between p-4">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="font-medium text-foreground">{threat.threat_type}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Source IP: {threat.source_ip}
          </p>
          <LocationDetails location={threat.location} sourceIp={threat.source_ip} />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
            {Math.round(threat.confidence_score * 100)}% confidence
          </span>
          <button
            onClick={() => onFalsePositive(threat.id)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark as False Positive
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="px-4 pb-4 border-t border-gray-700 animate-fade-in">
          <div className="mt-3 text-sm">
            <h4 className="font-medium mb-2">Scenario Details</h4>
            <p className="text-muted-foreground">{getScenarioDescription(threat)}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Detected at: {new Date(threat.detected_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};