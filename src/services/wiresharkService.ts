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
    console.log('Starting Wireshark capture...');
    const { data, error } = await supabase.functions.invoke('process-wireshark', {
      body: { action: 'start' }
    });

    if (error) {
      console.error('Error starting Wireshark capture:', error);
      throw error;
    }

    return data;
  },

  async stopCapture() {
    console.log('Stopping Wireshark capture...');
    const { data, error } = await supabase.functions.invoke('process-wireshark', {
      body: { action: 'stop' }
    });

    if (error) {
      console.error('Error stopping Wireshark capture:', error);
      throw error;
    }

    return data;
  },

  subscribeToPackets(callback: (packet: WiresharkPacket) => void) {
    const channel = supabase
      .channel('wireshark_packets')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'traffic_data'
      }, (payload) => {
        if (payload.new) {
          callback(payload.new as unknown as WiresharkPacket);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
};