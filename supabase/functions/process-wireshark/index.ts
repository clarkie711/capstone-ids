import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let isCapturing = false;
let captureInterval: number | null = null;
let wiresharkProcess: Deno.Process | null = null;

serve(async (req) => {
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

    if (action === 'start' && !isCapturing) {
      console.log('Starting Wireshark capture...');
      isCapturing = true;

      // Start tshark (Wireshark CLI) process
      try {
        wiresharkProcess = new Deno.Command('tshark', {
          args: ['-i', 'any', '-T', 'json', '-l'],
          stdout: 'piped',
        }).spawn();

        const decoder = new TextDecoder();
        let buffer = '';

        // Process the output stream
        for await (const chunk of wiresharkProcess.stdout.getReader()) {
          if (!isCapturing) break;
          
          buffer += decoder.decode(chunk);
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            try {
              const packet = JSON.parse(line);
              const packetSize = parseInt(packet.length) || 0;

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
              console.error('Error processing packet:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to start tshark:', error);
        isCapturing = false;
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to start packet capture' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Capture started', isRunning: isCapturing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stop') {
      console.log('Stopping Wireshark capture...');
      isCapturing = false;
      
      if (wiresharkProcess) {
        try {
          wiresharkProcess.kill('SIGTERM');
        } catch (error) {
          console.error('Error stopping tshark process:', error);
        }
        wiresharkProcess = null;
      }

      if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Capture stopped', isRunning: isCapturing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      return new Response(
        JSON.stringify({ success: true, isRunning: isCapturing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});