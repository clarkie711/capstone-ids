import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { generateSimulatedPacket } from './packetGenerator.ts';

export class CaptureManager {
  private supabaseClient: any;
  private isCapturing: boolean = false;
  private captureInterval: number | null = null;

  constructor(supabaseUrl: string, supabaseKey: string) {
    console.log('Initializing CaptureManager...');
    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  async startCapture() {
    console.log('Starting packet capture simulation...');
    
    if (this.isCapturing) {
      console.log('Capture already running, stopping first...');
      await this.stopCapture();
    }

    this.isCapturing = true;
    console.log('Capture status set to:', this.isCapturing);

    this.captureInterval = setInterval(async () => {
      if (!this.isCapturing) {
        console.log('Capture stopped, clearing interval...');
        if (this.captureInterval !== null) {
          clearInterval(this.captureInterval);
          this.captureInterval = null;
        }
        return;
      }

      try {
        const packetsToGenerate = Math.floor(Math.random() * 5) + 1;
        console.log(`Generating ${packetsToGenerate} packets...`);
        
        for (let i = 0; i < packetsToGenerate; i++) {
          const packet = generateSimulatedPacket();
          console.log(`Inserting packet ${i + 1}/${packetsToGenerate}:`, packet);
          
          const { error: logsError } = await this.supabaseClient
            .from('network_traffic_logs')
            .insert([packet]);

          if (logsError) {
            console.error('Error inserting network traffic log:', logsError);
            throw logsError;
          }

          const { error: trafficError } = await this.supabaseClient
            .from('traffic_data')
            .insert([{
              time: new Date().toISOString(),
              packets: packet.length
            }]);

          if (trafficError) {
            console.error('Error inserting traffic data:', trafficError);
            throw trafficError;
          }
        }
      } catch (e) {
        console.error('Error in capture interval:', e);
        if (e instanceof Error) {
          console.error('Capture error details:', e.message);
          console.error('Stack trace:', e.stack);
        }
      }
    }, Math.floor(Math.random() * 500) + 500);
  }

  async stopCapture() {
    console.log('Stopping packet capture...');
    this.isCapturing = false;
    
    if (this.captureInterval !== null) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
      console.log('Capture interval cleared');
    }
  }

  getStatus() {
    console.log('Getting capture status:', this.isCapturing);
    return this.isCapturing;
  }
}