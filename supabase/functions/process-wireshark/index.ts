import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Keep track of capture state and interval
let isCapturing = false;
let captureInterval: number | null = null;

serve(async (req) => {
  const startTime = Date.now();
  
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 25000);
    });

    const operationPromise = async () => {
      let body;
      try {
        body = await req.json();
        console.log('Received request body:', body);
      } catch (e) {
        console.error('Error parsing request body:', e);
        throw new Error('Invalid request body');
      }

      const { action } = body;
      console.log('Processing Wireshark action:', action);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (!supabaseClient) {
        throw new Error('Database connection failed');
      }

      if (action === 'start' && !isCapturing) {
        console.log('Starting Wireshark capture simulation...');
        isCapturing = true;
        
        // Clear any existing interval
        if (captureInterval) {
          clearInterval(captureInterval);
        }

        // Start generating traffic data
        const simulateTraffic = async () => {
          if (!isCapturing) {
            console.log('Capture stopped, skipping traffic simulation');
            return;
          }

          const simulatedPacket = {
            time: new Date().toISOString(),
            packets: Math.floor(Math.random() * 100) + 50
          };

          const { data, error: insertError } = await supabaseClient
            .from('traffic_data')
            .insert([simulatedPacket])
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting simulated packet:', insertError);
            throw insertError;
          }

          return data;
        };

        // Generate initial data point
        const data = await simulateTraffic();

        // Set up interval for continuous data generation
        // @ts-ignore: Deno global
        captureInterval = setInterval(async () => {
          try {
            if (isCapturing) {
              await simulateTraffic();
            }
          } catch (error) {
            console.error('Error in traffic simulation interval:', error);
          }
        }, 2000);

        console.log('Successfully started capture simulation');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Capture started', 
            data,
            isRunning: isCapturing 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'stop') {
        console.log('Stopping Wireshark capture simulation...');
        isCapturing = false;
        if (captureInterval) {
          clearInterval(captureInterval);
          captureInterval = null;
        }
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Capture stopped',
            isRunning: isCapturing 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'status') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            isRunning: isCapturing 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.warn('Invalid action received:', action);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Invalid action specified: ${action}`,
          isRunning: isCapturing
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    };

    const response = await Promise.race([operationPromise(), timeoutPromise]);
    const executionTime = Date.now() - startTime;
    console.log(`Operation completed in ${executionTime}ms`);
    
    return response;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`Error in process-wireshark function after ${executionTime}ms:`, error);
    
    const isTimeout = error.message === 'Operation timed out' || executionTime >= 25000;
    
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? 'Request timed out' : (error.message || 'An error occurred'),
        details: error.toString(),
        execution_time: executionTime,
        isRunning: isCapturing
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isTimeout ? 504 : 500
      }
    );
  }
});
