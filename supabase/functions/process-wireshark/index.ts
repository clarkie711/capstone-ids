import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WiresharkPacket {
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  length: number;
  info: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing Wireshark packets...');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const packets: WiresharkPacket[] = await req.json()
    console.log(`Received ${packets.length} packets for processing`);

    // Process each packet and insert into network_logs
    const processedLogs = packets.map(packet => ({
      timestamp: new Date(packet.timestamp),
      event_type: 'traffic',
      source_ip: packet.source_ip,
      destination_ip: packet.destination_ip,
      protocol: packet.protocol,
      status: 'success',
      message: packet.info,
      metadata: {
        bytes_transferred: packet.length,
        source: 'wireshark',
        capture_type: 'live'
      }
    }))

    console.log('Inserting processed packets into network_logs...');
    
    // Batch insert into network_logs
    const { error } = await supabaseClient
      .from('network_logs')
      .insert(processedLogs)

    if (error) {
      console.error('Error inserting packets:', error);
      throw error;
    }

    console.log('Successfully processed and stored packets');

    return new Response(
      JSON.stringify({ 
        message: 'Packets processed successfully',
        processed_count: packets.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }, 
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})