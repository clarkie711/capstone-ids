import { useQuery } from "@tanstack/react-query";
import { networkService } from "@/services/networkService";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { TrafficData } from "@/types/network";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type TrafficDataRow = Database['public']['Tables']['traffic_data']['Row'];
type ActiveConnectionRow = Database['public']['Tables']['active_connections']['Row'];

export const useNetworkData = () => {
  const [realtimeTraffic, setRealtimeTraffic] = useState<TrafficData[]>([]);
  const [activeConnectionsCount, setActiveConnectionsCount] = useState(0);

  const { data: initialTrafficData = [] } = useQuery({
    queryKey: ['trafficData'],
    queryFn: networkService.getTrafficData,
    refetchInterval: 5000,
  });

  const { data: blockedIPs = 0 } = useQuery({
    queryKey: ['blockedIPs'],
    queryFn: networkService.getBlockedIPs,
    refetchInterval: 10000,
  });

  const { data: networkLogs = [] } = useQuery({
    queryKey: ['networkLogs'],
    queryFn: networkService.getNetworkLogs,
    refetchInterval: 5000,
  });

  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    
    if (initialTrafficData.length > 0) {
      setRealtimeTraffic(initialTrafficData as TrafficData[]);
    }

    const trafficChannel = supabase
      .channel('traffic_updates')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public', 
          table: 'traffic_data' 
        },
        (payload: RealtimePostgresChangesPayload<TrafficDataRow>) => {
          console.log('Received traffic update:', payload);
          const newData = payload.new;
          if (newData && 'id' in newData && 'packets' in newData) {
            setRealtimeTraffic(current => {
              const updatedData = [...current];
              if (updatedData.length >= 24) {
                updatedData.shift();
              }
              updatedData.push({
                id: newData.id,
                time: typeof newData.time === 'string' ? newData.time : new Date().toISOString(),
                packets: newData.packets
              });
              return updatedData;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Traffic subscription status:', status);
      });

    const connectionsChannel = supabase
      .channel('connections_updates')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_connections'
        },
        (payload: RealtimePostgresChangesPayload<ActiveConnectionRow>) => {
          console.log('Received connections update:', payload);
          const newData = payload.new;
          if (newData && 'count' in newData) {
            setActiveConnectionsCount(newData.count);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions...');
      trafficChannel.unsubscribe();
      connectionsChannel.unsubscribe();
    };
  }, [initialTrafficData]);

  return {
    realtimeTraffic,
    activeConnectionsCount,
    blockedIPs,
    networkLogs,
  };
};