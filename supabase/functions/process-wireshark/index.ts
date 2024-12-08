import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let isCapturing = false;
let captureInterval: number | null = null;

// Enhanced protocol distribution for more realistic traffic
const protocolWeights = {
  HTTP: 30,
  HTTPS: 40,
  DNS: 10,
  TCP: 8,
  UDP: 7,
  ICMP: 5
};

const commonPorts = {
  HTTP: 80,
  HTTPS: 443,
  DNS: 53,
  SSH: 22,
  FTP: 21,
  SMTP: 25,
  POP3: 110,
  IMAP: 143,
  RDP: 3389,
  MySQL: 3306,
  PostgreSQL: 5432
};

// Generate realistic private IP ranges
function generatePrivateIP() {
  const ranges = [
    { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },
    { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
    { start: [172, 16, 0, 0], end: [172, 31, 255, 255] }
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  return range.start.map((start, i) => {
    const end = range.end[i];
    return Math.floor(Math.random() * (end - start + 1)) + start;
  }).join('.');
}

// Generate realistic public IP addresses
function generatePublicIP() {
  const nonPrivateRanges = [
    [1, 9], [11, 171], [173, 191], [193, 223]
  ];
  const range = nonPrivateRanges[Math.floor(Math.random() * nonPrivateRanges.length)];
  return [
    Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0],
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ].join('.');
}

// Select protocol based on weights
function selectWeightedProtocol() {
  const total = Object.values(protocolWeights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [protocol, weight] of Object.entries(protocolWeights)) {
    random -= weight;
    if (random <= 0) return protocol;
  }
  return 'TCP';
}

// Generate realistic packet info based on protocol
function generatePacketInfo(protocol: string, srcPort: number, dstPort: number) {
  const templates = {
    HTTP: [
      `GET /api/v1/users HTTP/1.1`,
      `POST /api/v1/data HTTP/1.1`,
      `PUT /api/v1/update HTTP/1.1`,
      `DELETE /api/v1/resource HTTP/1.1`
    ],
    HTTPS: [
      `TLSv1.2 Application Data`,
      `TLSv1.3 Handshake`,
      `Client Hello`,
      `Server Hello`
    ],
    DNS: [
      `Standard query A example.com`,
      `Standard query AAAA example.com`,
      `Standard query response A 93.184.216.34`,
      `Standard query MX example.com`
    ],
    TCP: [
      `[SYN] Seq=0 Win=64240`,
      `[ACK] Seq=1 Ack=1 Win=64240`,
      `[FIN, ACK] Seq=100 Ack=50`,
      `[RST] Seq=1000`
    ],
    UDP: [
      `Length=50`,
      `Length=100`,
      `SSDP Notify`,
      `MDNS Query`
    ],
    ICMP: [
      `Echo (ping) request`,
      `Echo (ping) reply`,
      `Destination unreachable`,
      `Time exceeded`
    ]
  };

  const template = templates[protocol as keyof typeof templates] || templates.TCP;
  return `${srcPort} → ${dstPort} ${template[Math.floor(Math.random() * template.length)]}`;
}

// Enhanced packet simulation with more realistic patterns
function generateSimulatedPacket() {
  const protocol = selectWeightedProtocol();
  const sourcePort = Math.floor(Math.random() * 65535);
  const destPort = commonPorts[protocol as keyof typeof commonPorts] || Math.floor(Math.random() * 65535);
  
  // 70% chance of internal to external communication
  const isInternalToExternal = Math.random() < 0.7;
  
  return {
    source_address: isInternalToExternal ? generatePrivateIP() : generatePublicIP(),
    destination_address: isInternalToExternal ? generatePublicIP() : generatePrivateIP(),
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

      // Start simulated packet capture with variable packet generation rate
      captureInterval = setInterval(async () => {
        if (!isCapturing) {
          if (captureInterval !== null) {
            clearInterval(captureInterval);
            captureInterval = null;
          }
          return;
        }

        try {
          // Generate 1-5 packets per interval for more realistic bursts
          const packetsToGenerate = Math.floor(Math.random() * 5) + 1;
          
          for (let i = 0; i < packetsToGenerate; i++) {
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
          }
        } catch (e) {
          console.error('Error in capture interval:', e);
          if (e instanceof Error) {
            console.error('Capture error details:', e.message);
          }
        }
      }, Math.floor(Math.random() * 500) + 500); // Random interval between 500ms and 1000ms

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