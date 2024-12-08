import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { CaptureManager } from './captureManager.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Initializing process-wireshark function...');

const captureManager = new CaptureManager(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  console.log('Received request:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action;
    console.log('Processing Wireshark action:', action);

    if (action === 'start') {
      await captureManager.startCapture();
      console.log('Capture started successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Capture started', isRunning: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'stop') {
      await captureManager.stopCapture();
      console.log('Capture stopped successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Capture stopped', isRunning: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      const status = captureManager.getStatus();
      console.log('Retrieved capture status:', status);
      return new Response(
        JSON.stringify({ success: true, isRunning: status }),
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
    const stackTrace = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { message: errorMessage, stack: stackTrace });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: stackTrace
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});