import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WiresharkPacket {
  timestamp: string;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
}

async function startTsharkCapture() {
  const process = new Deno.Command("tshark", {
    args: [
      "-i", "any",  // capture on all interfaces
      "-T", "json", // output in JSON format
      "-l"          // line-buffered output
    ],
    stdout: "piped",
    stderr: "piped"
  });

  const { stdout, stderr } = await process.output();
  
  if (stderr.length > 0) {
    console.error(new TextDecoder().decode(stderr));
    throw new Error("Tshark capture failed");
  }

  return new TextDecoder().decode(stdout);
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

    if (action === 'capture') {
      try {
        const captureData = await startTsharkCapture();
        const packets = JSON.parse(captureData);

        // Store capture data in Supabase
        const { error } = await supabaseClient
          .from('network_traffic_logs')
          .insert(packets.map((packet: any) => ({
            timestamp: new Date().toISOString(),
            source_address: packet._source.layers.ip?.["ip.src"] || "unknown",
            destination_address: packet._source.layers.ip?.["ip.dst"] || "unknown",
            protocol: packet._source.layers.frame?.["frame.protocols"] || "unknown",
            length: parseInt(packet._source.layers.frame?.["frame.len"] || "0"),
            info: packet._source.layers.frame?.["frame.protocols"] || ""
          })));

        if (error) throw error;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Capture data processed successfully' 
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.error('Error during packet capture:', error);
        throw error;
      }
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