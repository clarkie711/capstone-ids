import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const UserList = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Existing Users</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoadingUsers}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
          <div>Name</div>
          <div>Username</div>
          <div>Role</div>
          <div>Created At</div>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-4 gap-4 p-4">
              <div>{user.full_name}</div>
              <div>{user.username}</div>
              <div className="capitalize">{user.role}</div>
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};