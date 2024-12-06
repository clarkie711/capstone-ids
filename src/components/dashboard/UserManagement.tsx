import { useState } from "react";
import { UserCreationForm } from "./UserCreationForm";
import { UserList } from "./UserList";

export const UserManagement = () => {
  const [refreshUsers, setRefreshUsers] = useState(0);

  const handleUserCreated = () => {
    setRefreshUsers(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <UserCreationForm onUserCreated={handleUserCreated} />
      </div>

      <div className="mt-8">
        <UserList key={refreshUsers} />
      </div>
    </div>
  );
};