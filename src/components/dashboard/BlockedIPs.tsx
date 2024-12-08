import { useQuery } from "@tanstack/react-query";
import { Shield, Clock, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface BlockedIP {
  id: number;
  ip_address: string;
  blocked_at: string;
  reason: string | null;
}

const BlockedIPEntry = ({ ip }: { ip: BlockedIP }) => {
  const formattedDate = ip.blocked_at 
    ? new Date(ip.blocked_at).toLocaleString()
    : 'Unknown date';

  const displayReason = ip.reason || 'No reason provided';

  return (
    <div className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 transition-all duration-300 hover:bg-gray-800/50 hover:border-gray-600/50">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-foreground">
              {ip.ip_address}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {displayReason}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export const BlockedIPs = () => {
  const { data: blockedIPsData, isLoading, error } = useQuery({
    queryKey: ['blockedIPs'],
    queryFn: async () => {
      console.log('Fetching blocked IPs...');
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching blocked IPs:', error);
        throw error;
      }
      
      console.log('Raw blocked IPs data:', data);
      
      // Ensure we're returning an array of properly formatted BlockedIP objects
      const formattedData = (data || []).map((item): BlockedIP => ({
        id: item.id,
        ip_address: item.ip_address,
        blocked_at: item.blocked_at || '',
        reason: item.reason
      }));
      
      console.log('Formatted blocked IPs data:', formattedData);
      return formattedData;
    },
    refetchInterval: 5000,
  });

  if (error) {
    console.error('Query error:', error);
    return (
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <div className="p-4 text-red-500">Error loading blocked IPs</div>
      </Card>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-muted-foreground p-4">
          Loading...
        </div>
      );
    }

    if (!blockedIPsData || blockedIPsData.length === 0) {
      return (
        <div className="text-center text-muted-foreground p-4">
          No blocked IPs yet
        </div>
      );
    }

    return blockedIPsData.map((ip: BlockedIP) => (
      <BlockedIPEntry key={ip.id} ip={ip} />
    ));
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <div className="flex items-center gap-3 p-4 sticky top-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-t-lg border-b border-gray-700/50">
        <Shield className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Blocked IPs</h2>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="p-4 space-y-3">
          {renderContent()}
        </div>
      </ScrollArea>
    </Card>
  );
};