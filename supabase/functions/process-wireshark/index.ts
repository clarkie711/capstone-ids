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

    // Get current active connections from the database
    const { data: currentData, error: fetchError } = await supabaseClient
      .from('active_connections')
      .select('count')
      .single();

    if (fetchError) {
      console.error('Error fetching current connections:', fetchError);
      throw fetchError;
    }

    // Update with new count (for now using the existing count until Wireshark is integrated)
    const { error: updateError } = await supabaseClient
      .from('active_connections')
      .upsert({ 
        id: 1, 
        count: currentData?.count || 42,
        updated_at: new Date().toISOString()
      })
      .select();

    if (updateError) {
      console.error('Error updating active connections:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Successfully processed network data'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Error in process-wireshark function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message
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