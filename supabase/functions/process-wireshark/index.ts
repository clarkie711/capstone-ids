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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Execute tshark command to get current connections
    const command = new Deno.Command("tshark", {
      args: ["-i", "any", "-a", "duration:1", "-q", "-z", "conv,ip"],
      stdout: "piped",
      stderr: "piped",
    });

    try {
      const { stdout, stderr } = await command.output();
      const output = new TextDecoder().decode(stdout);
      const lines = output.split('\n');
      
      // Count active connections (excluding header and empty lines)
      const activeConnections = lines.filter(line => 
        line.trim() && !line.includes('===') && !line.includes('Conv')
      ).length;

      // Update the active_connections table
      const { error: updateError } = await supabaseClient
        .from('active_connections')
        .upsert({ id: 1, count: activeConnections })
        .select();

      if (updateError) {
        console.error('Error updating active connections:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          activeConnections,
          message: 'Successfully processed Wireshark data'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          }
        }
      );
    } catch (error) {
      console.error('Error executing tshark:', error);
      // Return a more graceful error response
      return new Response(
        JSON.stringify({ 
          error: 'Error processing network data',
          details: error.message
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

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
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