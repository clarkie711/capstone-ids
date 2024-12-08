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
  },

  async getRecentAlerts(): Promise<NetworkAlert[]> {
    console.log('Fetching recent alerts...');
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
  },

  async getActiveConnections(): Promise<number> {
    console.log('Fetching active connections...');
    try {
      // Call the Wireshark processing endpoint
      const { data: wiresharkData, error: wiresharkError } = await supabase.functions.invoke('process-wireshark', {
        body: { action: 'get-active-connections' }
      });

      if (wiresharkError) {
        console.error('Error fetching Wireshark data:', wiresharkError);
        throw wiresharkError;
      }

      // If we successfully got Wireshark data, use it
      if (wiresharkData && wiresharkData.activeConnections) {
        return wiresharkData.activeConnections;
      }

      // Fallback to database if Wireshark integration fails
      const { data, error } = await supabase
        .from('active_connections')
        .select('count')
        .single();

      if (error) {
        console.error('Error fetching active connections:', error);
        throw error;
      }
      
      return data?.count || 0;
    } catch (error) {
      console.error('Error in getActiveConnections:', error);
      return 0;
    }
  },

  async getBlockedIPs(): Promise<number> {
    console.log('Fetching blocked IPs...');
    const { count, error } = await supabase
      .from('blocked_ips')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error fetching blocked IPs:', error);
      throw error;
    }
    console.log('Blocked IPs count:', count);
    return count || 0;
  },

  async getActiveThreats(): Promise<NetworkThreat[]> {
    console.log('Fetching active threats...');
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
  },

  async logTrafficAnalysis(analysis: {
    timestamp: string;
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
  }) {
    console.log('Logging traffic analysis:', analysis);
    const { error } = await supabase
      .from('traffic_analysis')
      .insert([analysis]);

    if (error) {
      console.error('Error logging traffic analysis:', error);
      throw error;
    }
    console.log('Traffic analysis logged successfully');
  },

  async getNetworkLogs(): Promise<NetworkLog[]> {
    console.log('Fetching network logs...');
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
  },
};
