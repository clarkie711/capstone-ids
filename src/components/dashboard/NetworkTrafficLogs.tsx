import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetworkTrafficLog {
  id: number;
  timestamp: string;
  source_address: string;
  destination_address: string;
  protocol: string;
  length: number;
  info: string | null;
}

export const NetworkTrafficLogs = () => {
  const [logs, setLogs] = useState<NetworkTrafficLog[]>([]);
  const { toast } = useToast();

  const { data: initialLogs, refetch } = useQuery({
    queryKey: ['networkTrafficLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_traffic_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  useEffect(() => {
    const channel = supabase
      .channel('network_traffic_logs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'network_traffic_logs' 
        },
        (payload) => {
          console.log('Received network traffic log update:', payload);
          if (payload.new) {
            setLogs(current => {
              const updated = [payload.new as NetworkTrafficLog, ...current];
              return updated.slice(0, 100); // Keep only the latest 100 logs
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Network traffic logs subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Network traffic logs refreshed",
      });
    } catch (error) {
      console.error('Error refreshing logs:', error);
      toast({
        title: "Error",
        description: "Failed to refresh network traffic logs",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Network Traffic Logs</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Info</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                <TableCell>{log.source_address}</TableCell>
                <TableCell>{log.destination_address}</TableCell>
                <TableCell>{log.protocol}</TableCell>
                <TableCell>{log.length} bytes</TableCell>
                <TableCell>{log.info || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};