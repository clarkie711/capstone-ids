import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NetworkTrafficHeader } from "./NetworkTrafficHeader";
import { NetworkTrafficTable } from "./NetworkTrafficTable";
import type { NetworkTrafficLog } from "./types";
import { useQueryClient } from "@tanstack/react-query";

export const NetworkTrafficLogs = () => {
  const [logs, setLogs] = useState<NetworkTrafficLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const simulateTraffic = async () => {
    try {
      console.log('Starting network traffic simulation...');
      const { data, error } = await supabase.functions.invoke('process-wireshark', {
        body: { action: 'simulate' }
      });

      if (error) {
        console.error('Error in simulation:', error);
        throw error;
      }

      console.log('Simulation response:', data);
      
      if (data?.initial_packets) {
        console.log('Setting initial packets:', data.initial_packets);
        setLogs(data.initial_packets);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['trafficData'] });
      queryClient.invalidateQueries({ queryKey: ['networkLogs'] });
      
      toast({
        title: "Success",
        description: "Network simulation started successfully",
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Error",
        description: "Failed to start network simulation",
        variant: "destructive",
      });
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching network traffic logs...');
      const { data, error } = await supabase
        .from("network_traffic_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
        throw error;
      }
      
      console.log('Fetched logs:', data);
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch network traffic logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up network traffic monitoring...');
    fetchLogs();
    simulateTraffic(); // Start simulation when component mounts

    const channel = supabase
      .channel("network_traffic_logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "network_traffic_logs",
        },
        (payload) => {
          console.log('New network traffic log received:', payload);
          setLogs((currentLogs) => [payload.new as NetworkTrafficLog, ...currentLogs]);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['trafficData'] });
          queryClient.invalidateQueries({ queryKey: ['networkLogs'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up network traffic monitoring...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Card className="p-6">
      <NetworkTrafficHeader onRefresh={fetchLogs} isLoading={isLoading} />
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="rounded-md">
          <NetworkTrafficTable logs={logs} />
        </div>
      </ScrollArea>
    </Card>
  );
};

export default NetworkTrafficLogs;