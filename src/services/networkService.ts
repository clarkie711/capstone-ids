import { supabase } from '@/integrations/supabase/client';

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

export interface NetworkLog {
  id: number;
  timestamp: string;
  event_type: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
  port?: number;
  status: 'success' | 'failure' | 'warning';
  message: string;
  metadata?: {
    bytes_transferred?: number;
    duration?: number;
    error_code?: string;
    user_agent?: string;
    request_path?: string;
    response_code?: number;
  };
}

export interface TrafficData {
  time: string;
  packets: number;
}

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
      // First try to get the current count from the database
      const { data: connectionData, error: connectionError } = await supabase
        .from('active_connections')
        .select('count')
        .single();

      if (connectionError) {
        console.error('Error fetching active connections:', connectionError);
        return 42; // Default fallback
      }

      // Process Wireshark data
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
      
      return data || [];
    } catch (error) {
      console.error('Error fetching network logs:', error);
      return [];
    }
  }
};