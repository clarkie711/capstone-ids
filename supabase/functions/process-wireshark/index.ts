import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Received request body:', body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action } = body;
    console.log('Processing Wireshark action:', action);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!supabaseClient) {
      console.error('Failed to initialize Supabase client');
      throw new Error('Database connection failed');
    }

    if (action === 'start') {
      console.log('Starting Wireshark capture simulation...');
      
      const simulatedPacket = {
        time: new Date().toISOString(),
        packets: Math.floor(Math.random() * 100) + 50
      };

      const { data, error: insertError } = await supabaseClient
        .from('traffic_data')
        .insert([simulatedPacket]);

      if (insertError) {
        console.error('Error inserting simulated packet:', insertError);
        throw insertError;
      }

      console.log('Successfully started capture simulation');
      return new Response(
        JSON.stringify({ success: true, message: 'Capture started', data }),
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

    console.warn('Invalid action received:', action);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: `Invalid action specified: ${action}`
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
        error: error.message || 'An error occurred while processing the request',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});