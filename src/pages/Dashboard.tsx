import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { networkService } from "@/services/networkService";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SimulateAttack } from "@/components/dashboard/SimulateAttack";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { UserDropdown } from "@/components/dashboard/UserDropdown";

const Dashboard = () => {
  const { toast } = useToast();
  const [realtimeTraffic, setRealtimeTraffic] = useState([]);
  const [threats, setThreats] = useState([]);

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

  const { data: activeConnections = 0 } = useQuery({
    queryKey: ['activeConnections'],
    queryFn: networkService.getActiveConnections,
    refetchInterval: 10000,
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
      setRealtimeTraffic(initialTrafficData);
    }

    const trafficChannel = supabase
      .channel('traffic_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'traffic_data' },
        (payload) => {
          if (payload.new && 'time' in payload.new && 'packets' in payload.new) {
            setRealtimeTraffic(current => {
              const newData = [...current];
              if (newData.length >= 24) {
                newData.shift();
              }
              newData.push(payload.new);
              return newData;
            });
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

    return () => {
      trafficChannel.unsubscribe();
      threatChannel.unsubscribe();
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Network Security Dashboard</h1>
          <div className="flex items-center gap-4">
            <SimulateAttack />
            <UserDropdown />
          </div>
        </div>
        
        <DashboardLayout
          activeConnections={activeConnections}
          recentAlertsCount={recentAlerts.length}
          blockedIPs={blockedIPs}
          trafficData={realtimeTraffic}
          threats={threats}
          networkLogs={networkLogs}
          onFalsePositive={handleFalsePositive}
        />

        <div className="mt-8">
          <UserManagement />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;