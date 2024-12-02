import { supabase } from '@/lib/supabase';

export interface NetworkAlert {
  id: number;
  type: string;
  source: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
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

export interface NetworkThreat {
  id: number;
  threat_type: string;
  source_ip: string;
  confidence_score: number;
  is_false_positive: boolean;
  details: any;
  detected_at: string;
  location?: {
    country: string;
    city: string;
    lat: number;
    lon: number;
    region: string;
    metadata?: {
      source: string;
      isp?: string;
      org?: string;
      proxy?: boolean;
      hosting?: boolean;
      timezone?: string;
    };
  };
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
    return data || [];
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
    return data || [];
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
  }
};