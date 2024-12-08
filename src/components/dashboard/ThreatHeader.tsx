import { AlertCircle, Shield, MapPin } from "lucide-react";
import { LocationDetails } from "./LocationDetails";
import { NetworkThreat } from "@/types/network";

interface ThreatHeaderProps {
  threat: NetworkThreat;
}

export const ThreatHeader = ({ threat }: ThreatHeaderProps) => {
  return (
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
  );
};