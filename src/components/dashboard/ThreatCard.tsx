import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { NetworkThreat } from "@/services/networkService";
import { LocationDetails } from "./LocationDetails";
import { useState } from "react";

interface ThreatCardProps {
  threat: NetworkThreat;
  onFalsePositive: (threatId: number) => void;
}

export const ThreatCard = ({ threat, onFalsePositive }: ThreatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAttackDescription = (threat: NetworkThreat) => {
    const details = threat.details || {};
    switch (threat.threat_type) {
      case 'DDoS':
        return `Distributed Denial of Service attack detected with ${details.requestFrequency || 'high'} requests per second`;
      case 'Data Exfiltration':
        return `Suspicious data transfer detected with ${details.payloadSize ? (details.payloadSize / 1000000).toFixed(2) + 'MB' : 'large'} payload size`;
      case 'Brute Force':
        return `Multiple failed authentication attempts with ${details.errorRate ? (details.errorRate * 100).toFixed(1) + '%' : 'high'} error rate`;
      default:
        return `Suspicious activity detected with unusual traffic patterns`;
    }
  };

  return (
    <div className="flex flex-col bg-background rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="font-medium text-foreground">{threat.threat_type}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Source IP: {threat.source_ip}
          </p>
          <LocationDetails location={threat.location} />
        </div>
        <div className="flex items-center gap-4 ml-4">
          <span className={`px-2 py-1 rounded text-xs ${
            threat.confidence_score > 0.7
              ? "bg-destructive text-destructive-foreground"
              : "bg-warning text-warning-foreground"
          }`}>
            {Math.round(threat.confidence_score * 100)}% confidence
          </span>
          <button
            onClick={() => onFalsePositive(threat.id)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Mark as False Positive
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground"
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
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-3 text-sm">
            <h4 className="font-medium mb-2">Attack Details</h4>
            <p className="text-muted-foreground">{getAttackDescription(threat)}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              Detected at: {new Date(threat.detected_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};