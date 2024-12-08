import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SimulatedPacket {
  timestamp: string;
  source_address: string;
  destination_address: string;
  protocol: string;
  length: number;
  info: string;
}

function generateSimulatedPacket(): SimulatedPacket {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];
  const ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '192.168.0.1'];
  
  return {
    timestamp: new Date().toISOString(),
    source_address: ips[Math.floor(Math.random() * ips.length)],
    destination_address: ips[Math.floor(Math.random() * ips.length)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    length: Math.floor(Math.random() * 1500),
    info: `Simulated ${protocols[Math.floor(Math.random() * protocols.length)]} traffic`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();
    console.log('Processing Wireshark action:', action);

    if (action === 'capture' || action === 'start') {
      // Generate some simulated packets
      const packets = Array.from({ length: 5 }, () => generateSimulatedPacket());

      // Store simulated packets in Supabase
      const { error } = await supabaseClient
        .from('network_traffic_logs')
        .insert(packets);

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Capture data processed successfully',
          packets 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (action === 'stop') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Capture stopped successfully' 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (action === 'status') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          isRunning: true 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Invalid action specified' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    );

  } catch (error) {
    console.error('Error in wireshark-capture function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    );
  }
});