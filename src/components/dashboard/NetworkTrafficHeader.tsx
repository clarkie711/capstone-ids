import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface NetworkTrafficHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const NetworkTrafficHeader = ({ onRefresh, isLoading }: NetworkTrafficHeaderProps) => {
  return (
    <div className="flex items-center justify-between space-x-2 pb-4">
      <h2 className="text-lg font-semibold">Network Traffic Logs</h2>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};