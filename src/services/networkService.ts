import { supabase } from '@/integrations/supabase/client';
import { NetworkLog } from '@/types/network';

export interface NetworkAlert {
  id: number;
  type: string;
  source: string;
  timestamp: string;
  severity: string;
  location?: {
    latitude: number;
    longitude: number;
    country: string;
  };
}

export interface TrafficData {
  time: string;
  packets: number;
}

const mapDatabaseStatus = (status: string): NetworkLog['status'] => {
  switch (status.toLowerCase()) {
    case 'success':
      return 'success';
    case 'error':
    case 'failure':
      return 'error';
    default:
      return 'warning';
  }
};

export const networkService = {
  async getTrafficData(): Promise<TrafficData[]> {
    try {
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('time', { ascending: true })
        .limit(24);

      if (error) {
        console.error('Error fetching traffic data:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTrafficData:', error);
      return [];
    }
  },

  async getRecentAlerts(): Promise<NetworkAlert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent alerts:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      return [];
    }
  },

  async getActiveConnections(): Promise<number> {
    try {
      const { data: connectionData, error: connectionError } = await supabase
        .from('active_connections')
        .select('count')
        .single();

      if (connectionError) {
        console.error('Error fetching active connections:', connectionError);
        return 42;
      }

      const { error: processError } = await supabase.functions.invoke('process-wireshark', {
        body: { action: 'update' }
      });

      if (processError) {
        console.error('Error processing Wireshark data:', processError);
      }

      return connectionData?.count || 42;
    } catch (error) {
      console.error('Error in getActiveConnections:', error);
      return 42;
    }
  },

  async getBlockedIPs(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('blocked_ips')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching blocked IPs:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Error in getBlockedIPs:', error);
      return 0;
    }
  },

  async getNetworkLogs(): Promise<NetworkLog[]> {
    try {
      const { data, error } = await supabase
        .from('network_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching network logs:', error);
        return [];
      }
      
      // Map the database status to our NetworkLog status type
      return (data || []).map(log => ({
        ...log,
        status: mapDatabaseStatus(log.status)
      }));
    } catch (error) {
      console.error('Error fetching network logs:', error);
      return [];
    }
  }
};