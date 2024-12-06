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
    const { data, error } = await supabase
      .from('traffic_data')
      .select('*')
      .order('time', { ascending: true })
      .limit(24);

    if (error) throw error;
    return data || [];
  },

  async getRecentAlerts(): Promise<NetworkAlert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []) as NetworkAlert[];
  },

  async getActiveConnections(): Promise<number> {
    const { data, error } = await supabase
      .from('active_connections')
      .select('count')
      .single();

    if (error) throw error;
    return data?.count || 0;
  },

  async getBlockedIPs(): Promise<number> {
    const { count, error } = await supabase
      .from('blocked_ips')
      .select('*', { count: 'exact' });

    if (error) throw error;
    return count || 0;
  },

  async getActiveThreats(): Promise<NetworkThreat[]> {
    const { data, error } = await supabase
      .from('network_threats')
      .select('*')
      .eq('is_false_positive', false)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    const threats = (data || []).map(threat => ({
      ...threat,
      location: threat.location as Location,
      details: threat.details as ThreatDetails
    }));
    return threats;
  },

  async logTrafficAnalysis(analysis: {
    timestamp: string;
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
  }) {
    const { error } = await supabase
      .from('traffic_analysis')
      .insert([analysis]);

    if (error) throw error;
  },

  async getNetworkLogs(): Promise<NetworkLog[]> {
    const { data, error } = await supabase
      .from('network_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as NetworkLog[];
  },
};