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
import { AlertCircle, Shield, Activity, Globe } from "lucide-react";

// Mock data - replace with real data later
const trafficData = [
  { time: "00:00", packets: 400 },
  { time: "04:00", packets: 300 },
  { time: "08:00", packets: 600 },
  { time: "12:00", packets: 800 },
  { time: "16:00", packets: 500 },
  { time: "20:00", packets: 400 },
];

const recentAlerts = [
  {
    id: 1,
    type: "Port Scan",
    source: "192.168.1.100",
    timestamp: "2024-02-20 10:30:45",
    severity: "high",
  },
  {
    id: 2,
    type: "Suspicious Traffic",
    source: "10.0.0.15",
    timestamp: "2024-02-20 10:28:30",
    severity: "medium",
  },
];

const Dashboard = () => {
  const [activeConnections, setActiveConnections] = useState(42);
  const [alertsToday, setAlertsToday] = useState(15);
  const [blockedIPs, setBlockedIPs] = useState(7);

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
                <p className="text-sm text-muted-foreground">Alerts Today</p>
                <p className="text-2xl font-bold text-foreground">{alertsToday}</p>
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
            {recentAlerts.map((alert) => (
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