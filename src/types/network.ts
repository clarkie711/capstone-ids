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