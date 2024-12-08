import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { networkService } from "@/services/networkService";
import { wiresharkService } from "@/services/wiresharkService";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SimulateAttack } from "@/components/dashboard/SimulateAttack";
import { UserDropdown } from "@/components/dashboard/UserDropdown";
import { LayoutDashboard } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type TrafficDataRow = Database['public']['Tables']['traffic_data']['Row'];
type ActiveConnectionRow = Database['public']['Tables']['active_connections']['Row'];

interface TrafficData {
  id: number;
  time: string | null;
  packets: number;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [realtimeTraffic, setRealtimeTraffic] = useState<TrafficData[]>([]);
  const [threats, setThreats] = useState([]);
  const [activeConnectionsCount, setActiveConnectionsCount] = useState(0);

  // Initial data fetching
  const { data: initialTrafficData = [] } = useQuery({
    queryKey: ['trafficData'],
    queryFn: networkService.getTrafficData,
    refetchInterval: false,
  });

  const { data: recentAlerts = [] } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: networkService.getRecentAlerts,
    refetchInterval: 15000,
  });

  const { data: blockedIPs = 0 } = useQuery({
    queryKey: ['blockedIPs'],
    queryFn: networkService.getBlockedIPs,
    refetchInterval: 10000,
  });

  const { data: networkLogs = [] } = useQuery({
    queryKey: ['networkLogs'],
    queryFn: networkService.getNetworkLogs,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (initialTrafficData.length > 0) {
      setRealtimeTraffic(initialTrafficData as TrafficData[]);
    }

    // Subscribe to real-time traffic updates
    const trafficChannel = supabase
      .channel('traffic_updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'traffic_data' 
        },
        (payload: RealtimePostgresChangesPayload<TrafficDataRow>) => {
          console.log('Received traffic update:', payload);
          const newData = payload.new;
          if (newData && typeof newData.id === 'number' && typeof newData.packets === 'number') {
            setRealtimeTraffic(current => {
              const updatedData = [...current];
              if (updatedData.length >= 24) {
                updatedData.shift();
              }
              updatedData.push({
                id: newData.id,
                time: newData.time || new Date().toISOString(),
                packets: newData.packets
              });
              return updatedData;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to real-time active connections updates
    const connectionsChannel = supabase
      .channel('connections_updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_connections'
        },
        (payload: RealtimePostgresChangesPayload<ActiveConnectionRow>) => {
          console.log('Received connections update:', payload);
          const newData = payload.new;
          if (newData && typeof newData.count === 'number') {
            setActiveConnectionsCount(newData.count);
          }
        }
      )
      .subscribe();

    const threatChannel = supabase
      .channel('threat_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'network_threats' },
        (payload) => {
          if (payload.new) {
            const threat = payload.new;
            setThreats(current => [...current, threat]);
            
            toast({
              title: `New ${threat.threat_type} Detected`,
              description: `From IP: ${threat.source_ip} (Confidence: ${Math.round(threat.confidence_score * 100)}%)`,
              variant: threat.confidence_score > 0.7 ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    // Start the Wireshark capture when component mounts
    wiresharkService.startCapture()
      .then(() => {
        console.log('Wireshark capture started successfully');
      })
      .catch((error) => {
        console.error('Failed to start Wireshark capture:', error);
        toast({
          title: "Error",
          description: "Failed to start network capture",
          variant: "destructive",
        });
      });

    return () => {
      trafficChannel.unsubscribe();
      connectionsChannel.unsubscribe();
      threatChannel.unsubscribe();
      wiresharkService.stopCapture()
        .catch(error => {
          console.error('Error stopping Wireshark capture:', error);
        });
    };
  }, [initialTrafficData, toast]);

  const handleFalsePositive = async (threatId: number) => {
    const { error } = await supabase
      .from('network_threats')
      .update({ is_false_positive: true })
      .eq('id', threatId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as false positive",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Threat marked as false positive",
      });
      setThreats(current =>
        current.map(threat =>
          threat.id === threatId
            ? { ...threat, is_false_positive: true }
            : threat
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Network Security Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <SimulateAttack />
            <UserDropdown />
          </div>
        </div>
        
        <DashboardLayout
          activeConnections={activeConnectionsCount}
          recentAlertsCount={recentAlerts.length}
          blockedIPs={blockedIPs}
          trafficData={realtimeTraffic}
          threats={threats}
          networkLogs={networkLogs}
          onFalsePositive={handleFalsePositive}
        />
      </div>
    </div>
  );
};

export default Dashboard;
