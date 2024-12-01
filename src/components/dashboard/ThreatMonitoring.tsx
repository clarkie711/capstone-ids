import { Card } from "@/components/ui/card";
import { NetworkThreat } from "@/services/networkService";
import { MapPin, AlertTriangle, ChevronDown, ChevronUp, Globe2 } from "lucide-react";
import { useState } from "react";

interface ThreatMonitoringProps {
  threats: NetworkThreat[];
  onFalsePositive: (threatId: number) => void;
}

export const ThreatMonitoring = ({ threats, onFalsePositive }: ThreatMonitoringProps) => {
  const [expandedThreatId, setExpandedThreatId] = useState<number | null>(null);

  const toggleThreatDetails = (threatId: number) => {
    setExpandedThreatId(expandedThreatId === threatId ? null : threatId);
  };

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

  const formatCoordinates = (lat: number, lon: number) => {
    return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
  };

  return (
    <Card className="p-6 bg-secondary">
      <h2 className="text-lg font-semibold mb-4">Active Threats</h2>
      <div className="space-y-4">
        {threats
          .filter(threat => !threat.is_false_positive)
          .map((threat) => (
            <div
              key={threat.id}
              className="flex flex-col bg-background rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-4">
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="font-medium text-foreground">{threat.threat_type}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Source IP: {threat.source_ip}
                  </p>
                  <div className="bg-secondary/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">
                        Location Details
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {threat.location ? (
                        <>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {threat.location.city || 'Unknown City'}, {threat.location.region || 'Unknown Region'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe2 className="h-4 w-4" />
                            <span>{threat.location.country || 'Unknown Country'}</span>
                          </div>
                          {threat.location.lat && threat.location.lon && (
                            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                Coordinates: {formatCoordinates(threat.location.lat, threat.location.lon)}
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${threat.location.lat},${threat.location.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline ml-2"
                              >
                                View on Map
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="col-span-2 text-muted-foreground italic">
                          Location information unavailable
                        </div>
                      )}
                    </div>
                  </div>
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
                    onClick={() => toggleThreatDetails(threat.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {expandedThreatId === threat.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {expandedThreatId === threat.id && (
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
          ))}
      </div>
    </Card>
  );
};