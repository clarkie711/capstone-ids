import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let isCapturing = false;
let captureInterval: number | null = null;

// Simulate network traffic when we can't use tshark
function generateSimulatedPacket() {
  return Math.floor(Math.random() * 100) + 50; // Random packet size between 50-150
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

    // Validate action
    if (!action || typeof action !== 'string') {
      console.error('Invalid or missing action in request');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or missing action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (action === 'start') {
      console.log('Starting packet capture simulation...');
      
      if (isCapturing) {
        console.log('Capture already running');
        return new Response(
          JSON.stringify({ success: false, message: 'Capture already running', isRunning: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      isCapturing = true;

      // Start simulated packet capture
      if (captureInterval === null) {
        captureInterval = setInterval(async () => {
          if (!isCapturing) {
            if (captureInterval !== null) {
              clearInterval(captureInterval);
              captureInterval = null;
            }
            return;
          }

          try {
            const packetSize = generateSimulatedPacket();
            const { error } = await supabaseClient
              .from('traffic_data')
              .insert([{
                time: new Date().toISOString(),
                packets: packetSize
              }]);

            if (error) {
              console.error('Error inserting traffic data:', error);
            }
          } catch (e) {
            console.error('Error in capture interval:', e);
          }
        }, 1000); // Generate data every second
      }

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
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});