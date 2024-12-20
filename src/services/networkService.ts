import { supabase } from '@/integrations/supabase/client';
import { NetworkLog, NetworkLogMetadata } from '@/types/network';
import { Json } from '@/integrations/supabase/types';

// Export NetworkLog type to resolve the import error
export type { NetworkLog };

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

const parseMetadata = (metadata: Json | null): NetworkLogMetadata | undefined => {
  if (!metadata) return undefined;
  
  if (typeof metadata === 'object') {
    const {
      bytes_transferred,
      duration,
      error_code,
      user_agent,
      request_path,
      response_code
    } = metadata as Record<string, unknown>;

    return {
      bytes_transferred: typeof bytes_transferred === 'number' ? bytes_transferred : undefined,
      duration: typeof duration === 'number' ? duration : undefined,
      error_code: typeof error_code === 'string' ? error_code : undefined,
      user_agent: typeof user_agent === 'string' ? user_agent : undefined,
      request_path: typeof request_path === 'string' ? request_path : undefined,
      response_code: typeof response_code === 'number' ? response_code : undefined,
    };
  }
  
  return undefined;
};

export const networkService = {
  async getTrafficData(): Promise<TrafficData[]> {
    try {
      console.log('Fetching traffic data...');
      console.log('Supabase client initialized:', {
        url: import.meta.env.VITE_SUPABASE_URL,
      });
      
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('time', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching traffic data:', error);
        throw error;
      }
      
      console.log('Received traffic data:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getTrafficData:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  async getRecentAlerts(): Promise<NetworkAlert[]> {
    try {
      console.log('Fetching recent alerts...');
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent alerts:', error);
        return [];
      }
      
      console.log('Received alerts:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      return [];
    }
  },

  async getBlockedIPsList() {
    try {
      console.log('Fetching blocked IPs list...');
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching blocked IPs:', error);
        return [];
      }
      
      console.log('Received blocked IPs:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getBlockedIPsList:', error);
      return [];
    }
  },

  async getBlockedIPs(): Promise<number> {
    try {
      console.log('Fetching blocked IPs count...');
      const { count, error } = await supabase
        .from('blocked_ips')
        .select('*', { count: 'exact' });

      if (error) {
        console.error('Error fetching blocked IPs count:', error);
        return 0;
      }
      
      console.log('Received blocked IPs count:', count);
      return count || 0;
    } catch (error) {
      console.error('Error in getBlockedIPs:', error);
      return 0;
    }
  },

  async getNetworkLogs(): Promise<NetworkLog[]> {
    try {
      console.log('Fetching network logs...');
      console.log('Supabase client state:', {
        url: import.meta.env.VITE_SUPABASE_URL,
        session: await supabase.auth.getSession(),
      });

      const { data, error } = await supabase
        .from('network_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching network logs:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return [];
      }
      
      console.log('Received network logs:', data);
      return (data || []).map(log => ({
        ...log,
        status: mapDatabaseStatus(log.status),
        metadata: parseMetadata(log.metadata)
      }));
    } catch (error) {
      console.error('Error in getNetworkLogs:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }
};