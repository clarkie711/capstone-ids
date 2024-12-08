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
            {ip.reason || 'No reason provided'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {new Date(ip.blocked_at || '').toLocaleString()}
          </span>
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
      
      console.log('Blocked IPs data:', data);
      return data as BlockedIP[] || [];
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

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <div className="flex items-center gap-3 p-4 sticky top-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-t-lg border-b border-gray-700/50">
        <Shield className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-foreground">Blocked IPs</h2>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground p-4">
              Loading...
            </div>
          ) : !blockedIPsData || blockedIPsData.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No blocked IPs yet
            </div>
          ) : (
            blockedIPsData.map((ip: BlockedIP) => (
              <BlockedIPEntry key={ip.id} ip={ip} />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};