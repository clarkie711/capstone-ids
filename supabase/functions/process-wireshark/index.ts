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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, packets } = await req.json();

    if (action === 'start') {
      console.log('Starting Wireshark capture simulation...');
      // Simulate starting a capture session
      const simulatedPacket = {
        time: new Date().toISOString(),
        packets: Math.floor(Math.random() * 100) + 50
      };

      const { error: insertError } = await supabaseClient
        .from('traffic_data')
        .insert([simulatedPacket]);

      if (insertError) {
        console.error('Error inserting simulated packet:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Capture started' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stop') {
      console.log('Stopping Wireshark capture simulation...');
      return new Response(
        JSON.stringify({ success: true, message: 'Capture stopped' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process incoming packets
    if (packets && Array.isArray(packets)) {
      console.log(`Processing ${packets.length} packets...`);
      
      const trafficData = packets.map((packet: WiresharkPacket) => ({
        time: new Date().toISOString(),
        packets: packet.length
      }));

      const { error: insertError } = await supabaseClient
        .from('traffic_data')
        .insert(trafficData);

      if (insertError) {
        console.error('Error inserting traffic data:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully processed packets'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing packets'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});