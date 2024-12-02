import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { networkService, NetworkThreat, TrafficData } from "@/services/networkService";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { ThreatMonitoring } from "@/components/dashboard/ThreatMonitoring";
import { SimulateAttack } from "@/components/dashboard/SimulateAttack";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const Dashboard = () => {
  const { toast } = useToast();
  const [realtimeTraffic, setRealtimeTraffic] = useState<TrafficData[]>([]);
  const [threats, setThreats] = useState<NetworkThreat[]>([]);

  const { data: initialTrafficData = [] } = useQuery({
    queryKey: ['trafficData'],
    queryFn: networkService.getTrafficData,
    refetchInterval: false, // Disable refetch since we're using real-time
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch traffic data",
          variant: "destructive",
        });
      },
    },
  });

  const { data: recentAlerts = [] } = useQuery({
    queryKey: ['recentAlerts'],
    queryFn: networkService.getRecentAlerts,
    refetchInterval: 15000,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch alerts",
          variant: "destructive",
        });
      },
    },
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

  useEffect(() => {
    // Initialize with data from the query
    if (initialTrafficData.length > 0) {
      setRealtimeTraffic(initialTrafficData);
    }

    // Subscribe to real-time updates
    const trafficChannel = supabase
      .channel('traffic_updates')
      .on<TrafficData>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'traffic_data' 
        },
        (payload: RealtimePostgresChangesPayload<TrafficData>) => {
          console.log('Received traffic update:', payload.new);
          if (payload.new && 'time' in payload.new && 'packets' in payload.new) {
            setRealtimeTraffic(current => {
              const newData = [...current];
              if (newData.length >= 24) {
                newData.shift(); // Remove oldest data point
              }
              newData.push(payload.new as TrafficData);
              return newData;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Traffic subscription status:', status);
      });

    const threatChannel = supabase
      .channel('threat_updates')
      .on<NetworkThreat>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'network_threats' 
        },
        (payload: RealtimePostgresChangesPayload<NetworkThreat>) => {
          console.log('Received threat update:', payload.new);
          if (payload.new && 
              'threat_type' in payload.new && 
              'source_ip' in payload.new && 
              'confidence_score' in payload.new) {
            const threat = payload.new as NetworkThreat;
            setThreats(current => [...current, threat]);
            
            toast({
              title: `New ${threat.threat_type} Detected`,
              description: `From IP: ${threat.source_ip} (Confidence: ${Math.round(threat.confidence_score * 100)}%)`,
              variant: threat.confidence_score > 0.7 ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Threat subscription status:', status);
      });

    // Cleanup subscriptions
    return () => {
      trafficChannel.unsubscribe();
      threatChannel.unsubscribe();
    };
  }, [initialTrafficData, toast]); // Only re-run if initialTrafficData or toast changes

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
          <SimulateAttack />
        </div>
        
        <StatsOverview
          activeConnections={activeConnections}
          recentAlertsCount={recentAlerts.length}
          blockedIPs={blockedIPs}
        />
        
        <TrafficChart data={realtimeTraffic} />
        
        <ThreatMonitoring
          threats={threats}
          onFalsePositive={handleFalsePositive}
        />
      </div>
    </div>
  );
};

export default Dashboard;