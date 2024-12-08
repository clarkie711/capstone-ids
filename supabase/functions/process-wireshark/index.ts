import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let isCapturing = false;
let captureInterval: number | null = null;

// Enhanced packet simulation with more realistic network patterns
function generateSimulatedPacket() {
  // Base packet size between 64 (minimum Ethernet frame) and 1500 (typical MTU)
  const baseSize = Math.floor(Math.random() * (1500 - 64)) + 64;
  
  // Add some variation based on time of day to simulate real traffic patterns
  const hour = new Date().getHours();
  let multiplier = 1;
  
  // Simulate higher traffic during business hours
  if (hour >= 9 && hour <= 17) {
    multiplier = 1.5;
  } else if (hour >= 1 && hour <= 5) {
    // Lower traffic during early morning hours
    multiplier = 0.5;
  }
  
  return Math.floor(baseSize * multiplier);
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
        console.log('Capture already running, stopping first...');
        // Clear existing interval if it exists
        if (captureInterval !== null) {
          clearInterval(captureInterval);
          captureInterval = null;
        }
        isCapturing = false;
      }

      isCapturing = true;

      // Start simulated packet capture with enhanced error handling
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
          const { error: insertError } = await supabaseClient
            .from('traffic_data')
            .insert([{
              time: new Date().toISOString(),
              packets: packetSize
            }]);

          if (insertError) {
            console.error('Error inserting traffic data:', insertError);
            throw insertError;
          }
        } catch (e) {
          console.error('Error in capture interval:', e);
          // Don't stop capture on single error, just log it
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