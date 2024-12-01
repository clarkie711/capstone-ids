import { Card } from "@/components/ui/card";
import { NetworkThreat } from "@/services/networkService";
import { ThreatCard } from "./ThreatCard";

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
            <ThreatCard
              key={threat.id}
              threat={threat}
              onFalsePositive={onFalsePositive}
            />
          ))}
      </div>
    </Card>
  );
};