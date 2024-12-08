import { useQuery } from "@tanstack/react-query";
import { networkService } from "@/services/networkService";
import { Shield, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const BlockedIPs = () => {
  const { data: blockedIPs, isLoading } = useQuery({
    queryKey: ['blockedIPs'],
    queryFn: networkService.getBlockedIPsList,
    refetchInterval: 10000,
  });

  console.log('Blocked IPs data:', blockedIPs);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Blocked IPs</h3>
        </div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const ipsToDisplay = Array.isArray(blockedIPs) ? blockedIPs : [];

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold">Blocked IPs</h3>
      </div>
      <div className="space-y-3">
        {ipsToDisplay.length === 0 ? (
          <div className="text-sm text-muted-foreground">No blocked IPs found</div>
        ) : (
          ipsToDisplay.map((ip) => (
            <div 
              key={ip.id}
              className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="font-mono">{ip.ip_address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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