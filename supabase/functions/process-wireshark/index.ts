import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log('Processing Wireshark action:', action);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Invalid action specified'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing the request'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});