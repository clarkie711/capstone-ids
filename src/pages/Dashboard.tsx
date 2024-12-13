import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useNetworkData } from "@/hooks/useNetworkData";
import { useThreatManagement } from "@/hooks/useThreatManagement";

const Dashboard = () => {
  const { realtimeTraffic } = useNetworkData();
  const { threats, handleFalsePositive } = useThreatManagement();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader />
        <DashboardLayout
          trafficData={realtimeTraffic}
        />
      </div>
    </div>
  );
};

export default Dashboard;