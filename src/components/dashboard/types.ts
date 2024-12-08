export interface NetworkTrafficLog {
  id: number;
  timestamp: string;
  source_address: string;
  destination_address: string;
  protocol: string;
  length: number;
  info: string | null;
}