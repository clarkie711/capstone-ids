import { UserManagement as UserManagementComponent } from "@/components/dashboard/UserManagement";

const UserManagement = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <UserManagementComponent />
      </div>
    </div>
  );
};

export default UserManagement;