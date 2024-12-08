import { AlertCircle, ChevronDown, ChevronUp, Shield, MapPin, Clock, Ban } from "lucide-react";
import { NetworkThreat } from "@/types/network";
import { LocationDetails } from "./LocationDetails";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ThreatCardProps {
  threat: NetworkThreat;
  onFalsePositive: (threatId: number) => void;
}

export const ThreatCard = ({ threat, onFalsePositive }: ThreatCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (score >= 0.4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const handleBlockIP = async () => {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert([
          {
            ip_address: threat.source_ip,
            reason: `Blocked due to ${threat.threat_type} with ${Math.round(threat.confidence_score * 100)}% confidence`,
          }
        ]);

      if (error) throw error;

      toast({
        title: "IP Blocked Successfully",
        description: `${threat.source_ip} has been added to the blocked IPs list.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error Blocking IP",
        description: "Failed to block the IP address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "group flex flex-col rounded-xl overflow-hidden border border-gray-800/50",
      "bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm",
      "transition-all duration-300 hover:border-gray-700/80 hover:from-gray-900/70 hover:to-gray-800/50",
      "animate-fade-in shadow-lg hover:shadow-xl"
    )}>
      <div className="flex items-center justify-between p-4">
        <div className="space-y-3 w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {threat.threat_type}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Source IP: {threat.source_ip}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <LocationDetails location={threat.location} sourceIp={threat.source_ip} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border",
            "transition-colors duration-300",
            getConfidenceColor(threat.confidence_score)
          )}>
            {Math.round(threat.confidence_score * 100)}% confidence
          </span>
          
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleBlockIP}
          >
            <Ban className="h-4 w-4" />
            Block IP
          </Button>
          
          <button
            onClick={() => onFalsePositive(threat.id)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full border border-transparent hover:border-primary/30"
          >
            Mark as False Positive
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-primary transition-colors"
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
        </div>
      )}
    </div>
  );
};