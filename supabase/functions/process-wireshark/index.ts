import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let isCapturing = false;
let captureInterval: number | null = null;

// Common protocols for simulation
const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS'];
const commonPorts = {
  HTTP: 80,
  HTTPS: 443,
  DNS: 53,
  SSH: 22,
  FTP: 21,
};

// Generate realistic IP addresses
function generateIP() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}

// Generate packet info based on protocol
function generatePacketInfo(protocol: string, srcPort: number, dstPort: number) {
  switch (protocol) {
    case 'HTTP':
      return `${srcPort} → ${dstPort} [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256 SACK_PERM=1`;
    case 'DNS':
      return `Standard query 0x${Math.floor(Math.random() * 65535).toString(16)} A example.com`;
    case 'TCP':
      return `${srcPort} → ${dstPort} [ACK] Seq=${Math.floor(Math.random() * 1000)} Ack=${Math.floor(Math.random() * 1000)} Win=64240`;
    default:
      return `${srcPort} → ${dstPort} Len=${Math.floor(Math.random() * 1000)}`;
  }
}

// Enhanced packet simulation with more realistic network patterns
function generateSimulatedPacket() {
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const sourcePort = Math.floor(Math.random() * 65535);
  const destPort = commonPorts[protocol as keyof typeof commonPorts] || Math.floor(Math.random() * 65535);
  
  return {
    source_address: generateIP(),
    destination_address: generateIP(),
    protocol,
    length: Math.floor(Math.random() * (1500 - 64)) + 64, // Between 64 and 1500 bytes
    info: generatePacketInfo(protocol, sourcePort, destPort),
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;
    console.log('Processing Wireshark action:', action);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'start') {
      console.log('Starting packet capture simulation...');
      
      if (isCapturing) {
        console.log('Capture already running, stopping first...');
        if (captureInterval !== null) {
          clearInterval(captureInterval);
          captureInterval = null;
        }
        isCapturing = false;
      }

      isCapturing = true;

      // Start simulated packet capture
      captureInterval = setInterval(async () => {
        if (!isCapturing) {
          if (captureInterval !== null) {
            clearInterval(captureInterval);
            captureInterval = null;
          }
          return;
        }

        try {
          const packet = generateSimulatedPacket();
          
          // Insert into network_traffic_logs
          const { error: logsError } = await supabaseClient
            .from('network_traffic_logs')
            .insert([packet]);

          if (logsError) {
            console.error('Error inserting network traffic log:', logsError);
            throw logsError;
          }

          // Update traffic_data
          const { error: trafficError } = await supabaseClient
            .from('traffic_data')
            .insert([{
              time: new Date().toISOString(),
              packets: packet.length
            }]);

          if (trafficError) {
            console.error('Error inserting traffic data:', trafficError);
            throw trafficError;
          }
        } catch (e) {
          console.error('Error in capture interval:', e);
          if (e instanceof Error) {
            console.error('Capture error details:', e.message);
          }
        }
      }, 1000); // Generate data every second

      return new Response(
        JSON.stringify({ success: true, message: 'Capture started', isRunning: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stop') {
      console.log('Stopping packet capture...');
      isCapturing = false;
      
      if (captureInterval !== null) {
        clearInterval(captureInterval);
        captureInterval = null;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Capture stopped', isRunning: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      return new Response(
        JSON.stringify({ success: true, isRunning: isCapturing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Invalid action specified:', action);
    return new Response(
      JSON.stringify({ success: false, message: `Invalid action specified: ${action}`, isRunning: isCapturing }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});