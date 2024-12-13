import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SnortAlertHeaderProps {
  onRefresh: () => void;
}

export const SnortAlertHeader = ({ onRefresh }: SnortAlertHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Snort IDS Alerts</h2>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        className="gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        Refresh Alerts
      </Button>
    </div>
  );
};