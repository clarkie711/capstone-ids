import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle, Shield, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { networkService } from "@/services/networkService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { NetworkThreat } from "@/services/networkService";

const Dashboard = () => {
  const { toast } = useToast();
  const [realtimeTraffic, setRealtimeTraffic] = useState([]);
  const [threats, setThreats] = useState<NetworkThreat[]>([]);

  const { data: trafficData = [] } = useQuery({
    queryKey: ['trafficData'],
    queryFn: networkService.getTrafficData,
    refetchInterval: 30000,
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
    // Initialize with existing data
    setRealtimeTraffic(trafficData);
    
    // Subscribe to real-time traffic changes
    const trafficChannel = supabase
      .channel('traffic_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'traffic_data'
        },
        (payload) => {
          setRealtimeTraffic(current => {
            const newData = [...current];
            if (newData.length >= 24) {
              newData.shift();
            }
            newData.push(payload.new);
            return newData;
          });
        }
      )
      .subscribe();

    // Subscribe to real-time threat detection
    const threatChannel = supabase
      .channel('threat_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'network_threats'
        },
        (payload: { new: NetworkThreat }) => {
          const threat = payload.new;
          setThreats(current => [...current, threat]);
          
          toast({
            title: `New ${threat.threat_type} Detected`,
            description: `From IP: ${threat.source_ip} (Confidence: ${Math.round(threat.confidence_score * 100)}%)`,
            variant: threat.confidence_score > 0.7 ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trafficChannel);
      supabase.removeChannel(threatChannel);
    };
  }, [trafficData, toast]);

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
        <h1 className="text-2xl font-bold text-foreground">Network Security Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-secondary">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold text-foreground">{activeConnections}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-secondary">
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Recent Alerts</p>
                <p className="text-2xl font-bold text-foreground">{recentAlerts.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-secondary">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-danger" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked IPs</p>
                <p className="text-2xl font-bold text-foreground">{blockedIPs}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Traffic Chart */}
        <Card className="p-6 bg-secondary">
          <h2 className="text-lg font-semibold mb-4">Network Traffic (Real-time)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimeTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="packets"
                  stroke="#00A3FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Threat Monitoring */}
        <Card className="p-6 bg-secondary">
          <h2 className="text-lg font-semibold mb-4">Active Threats</h2>
          <div className="space-y-4">
            {threats
              .filter(threat => !threat.is_false_positive)
              .map((threat) => (
                <div
                  key={threat.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{threat.threat_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Source IP: {threat.source_ip}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      threat.confidence_score > 0.7
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-warning text-warning-foreground"
                    }`}>
                      {Math.round(threat.confidence_score * 100)}% confidence
                    </span>
                    <button
                      onClick={() => handleFalsePositive(threat.id)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Mark as False Positive
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;