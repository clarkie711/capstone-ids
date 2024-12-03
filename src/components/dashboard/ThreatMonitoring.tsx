import { NetworkThreat } from "@/services/networkService";
import { ThreatCard } from "./ThreatCard";

interface ThreatMonitoringProps {
  threats: NetworkThreat[];
  onFalsePositive: (threatId: number) => void;
}

export const ThreatMonitoring = ({ threats, onFalsePositive }: ThreatMonitoringProps) => {
  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4 sticky top-0">Active Threats</h2>
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