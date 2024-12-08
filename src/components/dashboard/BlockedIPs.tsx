import { useQuery } from "@tanstack/react-query";
import { networkService } from "@/services/networkService";
import { Shield, Clock, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const BlockedIPs = () => {
  const { data: blockedIPs, isLoading } = useQuery({
    queryKey: ['blockedIPs'],
    queryFn: networkService.getBlockedIPsList,
    refetchInterval: 10000,
  });

  console.log('Blocked IPs data:', blockedIPs);

  if (isLoading) {
    return (
      <div className="h-full relative">
        <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gradient-to-r from-red-950/90 to-red-900/90 backdrop-blur-sm p-4 rounded-lg">
          <Shield className="h-6 w-6 text-red-500 animate-pulse" />
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
              Blocked IPs
            </h2>
          </div>
        </div>
        <div className="text-sm text-muted-foreground px-4">Loading...</div>
      </div>
    );
  }

  const ipsToDisplay = Array.isArray(blockedIPs) ? blockedIPs : [];

  return (
    <div className="h-full relative">
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-gradient-to-r from-red-950/90 to-red-900/90 backdrop-blur-sm p-4 rounded-lg">
        <Shield className="h-6 w-6 text-red-500 animate-pulse" />
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-400">
            Blocked IPs
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="right"
              className="max-w-[300px] space-y-2 p-4 bg-red-950/95 border border-red-900/50 backdrop-blur-sm shadow-xl"
            >
              <p className="font-medium text-red-400">Understanding Blocked IPs:</p>
              <div className="space-y-2 text-sm text-red-200/70">
                <p>
                  <span className="font-medium text-red-200">IP Address:</span> The unique identifier of the blocked network connection.
                </p>
                <p>
                  <span className="font-medium text-red-200">Blocked Time:</span> Shows how long ago the IP was blocked from accessing the network.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-3 px-4">
        {ipsToDisplay.length === 0 ? (
          <div className="text-sm text-red-400/70">No blocked IPs found</div>
        ) : (
          ipsToDisplay.map((ip) => (
            <div 
              key={ip.id}
              className="flex items-center justify-between p-3 bg-red-950/30 border border-red-900/50 rounded-lg hover:bg-red-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="font-mono text-red-200">{ip.ip_address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-400/70">
                <Clock className="h-4 w-4" />
                <span>
                  {ip.blocked_at ? formatDistanceToNow(new Date(ip.blocked_at), { addSuffix: true }) : 'Unknown'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};