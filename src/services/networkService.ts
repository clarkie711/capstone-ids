import { supabase } from '@/integrations/supabase/client';
import { NetworkThreat, Location, ThreatDetails } from '@/types/network';

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
    console.log('Fetching traffic data...');
    try {
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('time', { ascending: true })
        .limit(24);

      if (error) {
        console.error('Error fetching traffic data:', error);
        throw error;
      }
      console.log('Traffic data fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getTrafficData:', error);
      return [];
    }
  },

  async getRecentAlerts(): Promise<NetworkAlert[]> {
    console.log('Fetching recent alerts...');
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent alerts:', error);
        throw error;
      }
      console.log('Recent alerts fetched:', data);
      return (data || []) as NetworkAlert[];
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      return [];
    }
  },

  async getActiveConnections(): Promise<number> {
    console.log('Fetching active connections...');
    try {
      // First try to get from active_connections table
      const { data: connectionData, error: connectionError } = await supabase
        .from('active_connections')
        .select('count')
        .single();

      if (!connectionError && connectionData) {
        return connectionData.count;
      }

      // Fallback to a default value if there's an error
      console.log('Using default active connections count');
      return 42;
    } catch (error) {
      console.error('Error in getActiveConnections:', error);
      return 42;
    }
  },

  async getBlockedIPs(): Promise<number> {
    console.log('Fetching blocked IPs...');
    try {
      const { count, error } = await supabase
        .from('blocked_ips')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching blocked IPs:', error);
        throw error;
      }
      console.log('Blocked IPs count:', count);
      return count || 0;
    } catch (error) {
      console.error('Error in getBlockedIPs:', error);
      return 0;
    }
  },

  async getActiveThreats(): Promise<NetworkThreat[]> {
    console.log('Fetching active threats...');
    try {
      const { data, error } = await supabase
        .from('network_threats')
        .select('*')
        .eq('is_false_positive', false)
        .order('detected_at', { ascending: false });

      if (error) {
        console.error('Error fetching active threats:', error);
        throw error;
      }
      console.log('Active threats fetched:', data);
      const threats = (data || []).map(threat => ({
        ...threat,
        location: threat.location as unknown as Location,
        details: threat.details as unknown as ThreatDetails
      }));
      return threats;
    } catch (error) {
      console.error('Error in getActiveThreats:', error);
      return [];
    }
  },

  async logTrafficAnalysis(analysis: {
    timestamp: string;
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
  }) {
    console.log('Logging traffic analysis:', analysis);
    try {
      const { error } = await supabase
        .from('traffic_analysis')
        .insert([analysis]);

      if (error) {
        console.error('Error logging traffic analysis:', error);
        throw error;
      }
      console.log('Traffic analysis logged successfully');
    } catch (error) {
      console.error('Error in logTrafficAnalysis:', error);
      throw error;
    }
  },

  async getNetworkLogs(): Promise<NetworkLog[]> {
    console.log('Fetching network logs...');
    try {
      const { data, error } = await supabase
        .from('network_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching network logs:', error);
        throw error;
      }
      console.log('Network logs fetched:', data);
      return (data || []) as NetworkLog[];
    } catch (error) {
      console.error('Error fetching network logs:', error);
      return [];
    }
  },
};