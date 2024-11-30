import { Activity, AlertCircle, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsOverviewProps {
  activeConnections: number;
  recentAlertsCount: number;
  blockedIPs: number;
}

export const StatsOverview = ({
  activeConnections,
  recentAlertsCount,
  blockedIPs,
}: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 bg-secondary">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Active Connections</p>
            <p className="text-2xl font-bold text-foreground">{activeConnections}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-secondary">
        <div className="flex items-center space-x-4">
          <AlertCircle className="h-8 w-8 text-warning" />
          <div>
            <p className="text-sm text-muted-foreground">Recent Alerts</p>
            <p className="text-2xl font-bold text-foreground">{recentAlertsCount}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-secondary">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-danger" />
          <div>
            <p className="text-sm text-muted-foreground">Blocked IPs</p>
            <p className="text-2xl font-bold text-foreground">{blockedIPs}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};