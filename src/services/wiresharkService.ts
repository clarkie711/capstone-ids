import { supabase } from "@/integrations/supabase/client";

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
    console.log('Processing Wireshark packets:', packets);
    const { data, error } = await supabase.functions.invoke('process-wireshark', {
      body: { packets }
    });

    if (error) {
      console.error('Error processing packets:', error);
      throw error;
    }
    return data;
  },

  async startCapture() {
    console.log('Starting Wireshark capture...');
    
    // First check if capture is already running
    const status = await this.getCaptureStatus();
    if (status) {
      console.log('Capture already running, stopping first...');
      await this.stopCapture();
    }

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

  async getCaptureStatus() {
    console.log('Checking Wireshark capture status...');
    const { data, error } = await supabase.functions.invoke('process-wireshark', {
      body: { action: 'status' }
    });

    if (error) {
      console.error('Error getting capture status:', error);
      throw error;
    }

    return data?.isRunning || false;
  },

  subscribeToPackets(callback: (packet: WiresharkPacket) => void) {
    console.log('Setting up Wireshark packet subscription...');
    const channel = supabase
      .channel('wireshark_packets')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'traffic_data'
      }, (payload) => {
        console.log('Received Wireshark packet:', payload);
        if (payload.new) {
          callback(payload.new as unknown as WiresharkPacket);
        }
      })
      .subscribe((status) => {
        console.log('Wireshark subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from Wireshark packets...');
      channel.unsubscribe();
    };
  }
};