import { Json } from '@/integrations/supabase/types';

export interface LocationMetadata {
  source: string;
  isp?: string;
  org?: string;
  proxy?: boolean;
  hosting?: boolean;
  timezone?: string;
}

export interface Location {
  country: string;
  city: string;
  lat: number;
  lon: number;
  region: string;
  metadata?: LocationMetadata;
}

export interface ThreatDetails {
  ports_scanned?: number;
  scan_type?: string;
  bandwidth_usage?: string;
  duration?: string;
  attempts?: number;
  interval?: string;
}

export interface NetworkThreat {
  id: number;
  threat_type: string;
  source_ip: string;
  confidence_score: number;
  is_false_positive: boolean;
  details: ThreatDetails;
  detected_at: string;
  location: Location;
}

export interface NetworkLog {
  id: number;
  timestamp: string;
  event_type: string;
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
  port?: number;
  status: 'success' | 'warning' | 'error';  // Updated to match what's used in NetworkLogs.tsx
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