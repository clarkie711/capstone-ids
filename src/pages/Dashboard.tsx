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
import { networkService, NetworkAlert, TrafficData } from "@/services/networkService";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();

  const { data: trafficData = [] } = useQuery<TrafficData[]>({
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

  const { data: recentAlerts = [] } = useQuery<NetworkAlert[]>({
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

  const { data: activeConnections = 0 } = useQuery<number>({
    queryKey: ['activeConnections'],
    queryFn: networkService.getActiveConnections,
    refetchInterval: 10000,
  });

  const { data: blockedIPs = 0 } = useQuery<number>({
    queryKey: ['blockedIPs'],
    queryFn: networkService.getBlockedIPs,
    refetchInterval: 10000,
  });

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
                <p className="text-2xl font-bold text-foreground">{(recentAlerts as NetworkAlert[]).length}</p>
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
          <h2 className="text-lg font-semibold mb-4">Network Traffic</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
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

        {/* Recent Alerts */}
        <Card className="p-6 bg-secondary">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {(recentAlerts as NetworkAlert[]).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{alert.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Source: {alert.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{alert.timestamp}</p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      alert.severity === "high"
                        ? "bg-danger text-white"
                        : "bg-warning text-black"
                    }`}
                  >
                    {alert.severity}
                  </span>
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