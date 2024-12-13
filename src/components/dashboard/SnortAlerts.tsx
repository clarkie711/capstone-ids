import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SnortAlertHeader } from "./SnortAlertHeader";
import { SnortAlertRow } from "./SnortAlertRow";

interface SnortAlert {
  id: number;
  timestamp: string;
  signature_id: number;
  signature_name: string;
  classification?: string;
  priority?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  protocol?: string;
  source_ip: string;
  source_port?: number;
  destination_ip: string;
  destination_port?: number;
  processed: boolean;
  false_positive: boolean;
}

export const SnortAlerts = () => {
  const [alerts, setAlerts] = useState<SnortAlert[]>([]);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('snort_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching GeoSecure Watchdog alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch GeoSecure Watchdog alerts",
        variant: "destructive",
      });
    }
  };

  const markAsFalsePositive = async (alertId: number) => {
    try {
      const { error } = await supabase
        .from('snort_alerts')
        .update({ false_positive: true })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "GeoSecure Watchdog alert marked as false positive",
      });
      
      fetchAlerts();
    } catch (error) {
      console.error('Error marking GeoSecure Watchdog alert as false positive:', error);
      toast({
        title: "Error",
        description: "Failed to update GeoSecure Watchdog alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('snort_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'snort_alerts',
        },
        (payload) => {
          console.log('New GeoSecure Watchdog alert received:', payload);
          setAlerts((current) => [payload.new as SnortAlert, ...current]);
          
          if ((payload.new as SnortAlert).severity === 'high' || (payload.new as SnortAlert).severity === 'critical') {
            toast({
              title: "High Severity Alert",
              description: `New ${(payload.new as SnortAlert).severity} severity GeoSecure Watchdog alert detected`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <Card className="p-6">
      <SnortAlertHeader onRefresh={fetchAlerts} />
      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <SnortAlertRow
                key={alert.id}
                alert={alert}
                onMarkFalsePositive={markAsFalsePositive}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};