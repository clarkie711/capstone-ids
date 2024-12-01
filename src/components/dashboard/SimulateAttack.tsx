import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const SimulateAttack = () => {
  const { toast } = useToast();

  const handleSimulation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('simulate-attack');
      
      if (error) throw error;

      toast({
        title: "Attack Simulation Started",
        description: "Multiple attack vectors have been simulated. Monitor the dashboard for updates.",
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Failed to start attack simulation",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleSimulation}
      variant="destructive"
      className="ml-auto"
    >
      Simulate Attack
    </Button>
  );
};