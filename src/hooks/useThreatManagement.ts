import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { wiresharkService } from "@/services/wiresharkService";

export const useThreatManagement = () => {
  const { toast } = useToast();
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    console.log('Setting up threat monitoring...');
    
    wiresharkService.startCapture()
      .then(() => {
        console.log('Wireshark capture started successfully');
      })
      .catch((error) => {
        console.error('Failed to start Wireshark capture:', error);
        toast({
          title: "Error",
          description: "Failed to start network capture",
          variant: "destructive",
        });
      });

    const threatChannel = supabase
      .channel('threat_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'network_threats' },
        (payload) => {
          if (payload.new) {
            const threat = payload.new;
            setThreats(current => [...current, threat]);
            
            toast({
              title: `New ${threat.threat_type} Detected`,
              description: `From IP: ${threat.source_ip} (Confidence: ${Math.round(threat.confidence_score * 100)}%)`,
              variant: threat.confidence_score > 0.7 ? "destructive" : "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up threat monitoring...');
      threatChannel.unsubscribe();
      wiresharkService.stopCapture()
        .catch(error => {
          console.error('Error stopping Wireshark capture:', error);
        });
    };
  }, [toast]);

  const handleFalsePositive = async (threatId: number) => {
    const { error } = await supabase
      .from('network_threats')
      .update({ is_false_positive: true })
      .eq('id', threatId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to mark as false positive",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Threat marked as false positive",
      });
      setThreats(current =>
        current.map(threat =>
          threat.id === threatId
            ? { ...threat, is_false_positive: true }
            : threat
        )
      );
    }
  };

  return {
    threats,
    handleFalsePositive,
  };
};