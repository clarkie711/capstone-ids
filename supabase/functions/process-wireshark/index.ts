import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { CaptureManager } from './captureManager.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const captureManager = new CaptureManager(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;
    console.log('Processing Wireshark action:', action);

    if (action === 'start') {
      await captureManager.startCapture();
      return new Response(
        JSON.stringify({ success: true, message: 'Capture started', isRunning: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stop') {
      await captureManager.stopCapture();
      return new Response(
        JSON.stringify({ success: true, message: 'Capture stopped', isRunning: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      return new Response(
        JSON.stringify({ success: true, isRunning: captureManager.getStatus() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Invalid action specified:', action);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Invalid action specified: ${action}`, 
        isRunning: captureManager.getStatus() 
      }),
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