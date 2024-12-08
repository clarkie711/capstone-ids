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
      <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300 group">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Network Connections</p>
            <p className="text-3xl font-bold text-foreground mt-1">{activeConnections}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300 group">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Educational Scenarios</p>
            <p className="text-3xl font-bold text-foreground mt-1">{recentAlertsCount}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-colors duration-300 group">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Filtered IPs</p>
            <p className="text-3xl font-bold text-foreground mt-1">{blockedIPs}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};