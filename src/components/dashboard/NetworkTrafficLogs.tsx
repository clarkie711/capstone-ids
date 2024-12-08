import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NetworkTrafficHeader } from "./NetworkTrafficHeader";
import { NetworkTrafficTable } from "./NetworkTrafficTable";
import type { NetworkTrafficLog } from "./types";

export const NetworkTrafficLogs = () => {
  const [logs, setLogs] = useState<NetworkTrafficLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startCapture = async () => {
    try {
      console.log('Starting capture...');
      const { data, error } = await supabase.functions.invoke('process-wireshark', {
        body: { action: 'start' }
      });

      if (error) {
        console.error('Error starting capture:', error);
        throw error;
      }

      console.log('Capture response:', data);
      toast({
        title: "Success",
        description: "Network capture started successfully",
      });
    } catch (error) {
      console.error('Error starting capture:', error);
      toast({
        title: "Error",
        description: "Failed to start network capture",
        variant: "destructive",
      });
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching logs...');
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
    fetchLogs();
    startCapture(); // Start capture when component mounts

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
          console.log('New log received:', payload);
          setLogs((currentLogs) => [payload.new as NetworkTrafficLog, ...currentLogs]);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

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