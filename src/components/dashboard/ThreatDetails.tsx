import { Clock } from "lucide-react";
import { NetworkThreat } from "@/types/network";

interface ThreatDetailsProps {
  threat: NetworkThreat;
}

export const ThreatDetails = ({ threat }: ThreatDetailsProps) => {
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
    <div className="mt-3 space-y-3">
      <h4 className="font-medium text-primary/80">Scenario Details</h4>
      <p className="text-sm text-muted-foreground">
        {getScenarioDescription(threat)}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Detected at: {new Date(threat.detected_at).toLocaleString()}</span>
      </div>
    </div>
  );
};