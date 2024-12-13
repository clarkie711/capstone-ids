import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

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
      console.error('Error fetching Snort alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Snort alerts",
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
        description: "Alert marked as false positive",
      });
      
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as false positive:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription
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
          console.log('New Snort alert received:', payload);
          setAlerts((current) => [payload.new as SnortAlert, ...current]);
          
          // Show toast notification for high severity alerts
          if ((payload.new as SnortAlert).severity === 'high' || (payload.new as SnortAlert).severity === 'critical') {
            toast({
              title: "High Severity Alert",
              description: `New ${(payload.new as SnortAlert).severity} severity alert detected`,
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

  const getSeverityColor = (severity: SnortAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Snort IDS Alerts</h2>
        </div>
        <Button
          variant="outline"
          onClick={fetchAlerts}
          className="gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Refresh Alerts
        </Button>
      </div>

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
              <TableRow key={alert.id}>
                <TableCell>
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <span className={`font-semibold ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate">
                    {alert.signature_name}
                  </div>
                </TableCell>
                <TableCell>
                  {alert.source_ip}
                  {alert.source_port && `:${alert.source_port}`}
                </TableCell>
                <TableCell>
                  {alert.destination_ip}
                  {alert.destination_port && `:${alert.destination_port}`}
                </TableCell>
                <TableCell>{alert.protocol || 'N/A'}</TableCell>
                <TableCell>
                  {!alert.false_positive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsFalsePositive(alert.id)}
                    >
                      Mark as False Positive
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};