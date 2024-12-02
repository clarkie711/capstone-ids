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
        title: "Educational Simulation Started",
        description: "Controlled network monitoring scenarios have been initiated for demonstration purposes.",
      });
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Failed to start educational simulation",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleSimulation}
      variant="outline"
      className="ml-auto"
    >
      Run Educational Simulation
    </Button>
  );
};