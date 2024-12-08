import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useThreatManagement } from "@/hooks/useThreatManagement";

const Dashboard = () => {
  const { realtimeTraffic, networkLogs } = useNetworkData();
  const { threats, handleFalsePositive } = useThreatManagement();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        <DashboardLayout
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