import { supabase } from '@/integrations/supabase/client';

interface WiresharkPacket {
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  length: number;
  info: string;
}

export const wiresharkService = {
  async processPackets(packets: WiresharkPacket[]) {
    const { data, error } = await supabase.functions.invoke('process-wireshark', {
      body: packets,
    });

    if (error) throw error;
    return data;
  },

  async startCapture() {
    // This function would be called when starting a new capture session
    console.log('Starting Wireshark capture...');
    // In a real implementation, this would interface with Wireshark's command-line tools
  },

  async stopCapture() {
    // This function would be called when stopping a capture session
    console.log('Stopping Wireshark capture...');
    // In a real implementation, this would interface with Wireshark's command-line tools
  }
};