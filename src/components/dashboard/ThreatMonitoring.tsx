import { Card } from "@/components/ui/card";
import { NetworkThreat } from "@/services/networkService";
import { MapPin } from "lucide-react";

interface ThreatMonitoringProps {
  threats: NetworkThreat[];
  onFalsePositive: (threatId: number) => void;
}

export const ThreatMonitoring = ({ threats, onFalsePositive }: ThreatMonitoringProps) => {
  return (
    <Card className="p-6 bg-secondary">
      <h2 className="text-lg font-semibold mb-4">Active Threats</h2>
      <div className="space-y-4">
        {threats
          .filter(threat => !threat.is_false_positive)
          .map((threat) => (
            <div
              key={threat.id}
              className="flex items-center justify-between p-4 bg-background rounded-lg"
            >
              <div className="space-y-2">
                <p className="font-medium text-foreground">{threat.threat_type}</p>
                <p className="text-sm text-muted-foreground">
                  Source IP: {threat.source_ip}
                </p>
                {threat.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {threat.location.city}, {threat.location.region}, {threat.location.country}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
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
              </div>
            </div>
        ))}
      </div>
    </Card>
  );
};