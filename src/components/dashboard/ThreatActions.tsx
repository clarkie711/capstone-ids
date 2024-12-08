import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ThreatActionsProps {
  threatId: number;
  sourceIp: string;
  threatType: string;
  confidenceScore: number;
  onFalsePositive: (threatId: number) => void;
}

export const ThreatActions = ({
  threatId,
  sourceIp,
  threatType,
  confidenceScore,
  onFalsePositive,
}: ThreatActionsProps) => {
  const { toast } = useToast();

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (score >= 0.4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const handleBlockIP = async () => {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert([
          {
            ip_address: sourceIp,
            reason: `Blocked due to ${threatType} with ${Math.round(confidenceScore * 100)}% confidence`,
          }
        ]);

      if (error) throw error;

      toast({
        title: "IP Blocked Successfully",
        description: `${sourceIp} has been added to the blocked IPs list.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error Blocking IP",
        description: "Failed to block the IP address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-3 ml-4">
      <span className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border",
        "transition-colors duration-300",
        getConfidenceColor(confidenceScore)
      )}>
        {Math.round(confidenceScore * 100)}% confidence
      </span>
      
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={handleBlockIP}
      >
        <Ban className="h-4 w-4" />
        Block IP
      </Button>
      
      <button
        onClick={() => onFalsePositive(threatId)}
        className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full border border-transparent hover:border-primary/30"
      >
        Mark as False Positive
      </button>
    </div>
  );
};