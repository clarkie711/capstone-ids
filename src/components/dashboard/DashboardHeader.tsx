import { LayoutDashboard } from "lucide-react";
import { SimulateAttack } from "./SimulateAttack";
import { UserDropdown } from "./UserDropdown";

export const DashboardHeader = () => {
  return (
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
  );
};