import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Users, LogOut, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

export const UserDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-secondary dark:bg-gray-800 text-secondary-foreground dark:text-white"
      >
        <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-default hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-600"
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Account</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
              {userEmail || 'Loading...'}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate("/user-management")}
          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-600"
        >
          <Users className="mr-2 h-4 w-4" />
          User Management
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};