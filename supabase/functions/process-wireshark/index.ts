import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateSimulatedPacket } from './packetGenerator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const { action } = await req.json()
    console.log('Received request with action:', action)

    if (action === 'simulate') {
      console.log('Starting simulation...')
      // Generate initial simulated packets
      const initialPackets = Array.from({ length: 10 }, () => generateSimulatedPacket())
      console.log('Generated initial packets:', initialPackets)

      // Store initial packets in Supabase
      const { error: insertError } = await supabaseClient
        .from('network_traffic_logs')
        .insert(initialPackets)

      if (insertError) {
        console.error('Error inserting initial packets:', insertError)
        throw insertError
      }

      // Also generate initial traffic data
      const initialTrafficData = {
        time: new Date().toISOString(),
        packets: Math.floor(Math.random() * 100) + 50
      }

      const { error: trafficError } = await supabaseClient
        .from('traffic_data')
        .insert([initialTrafficData])

      if (trafficError) {
        console.error('Error inserting traffic data:', trafficError)
        throw trafficError
      }

      // Set up periodic packet generation (runs for 5 minutes)
      let packetCount = 0
      const maxPackets = 300 // 5 minutes * 60 seconds = 300 packets at 1 per second
      
      const interval = setInterval(async () => {
        if (packetCount >= maxPackets) {
          console.log('Reached maximum packets, stopping simulation')
          clearInterval(interval)
          return
        }

        const newPacket = generateSimulatedPacket()
        console.log('Generated new packet:', newPacket)
        
        const { error: newPacketError } = await supabaseClient
          .from('network_traffic_logs')
          .insert([newPacket])

        if (newPacketError) {
          console.error('Error inserting new packet:', newPacketError)
        }

        // Also update traffic data
        const newTrafficData = {
          time: new Date().toISOString(),
          packets: Math.floor(Math.random() * 100) + 50
        }

        const { error: newTrafficError } = await supabaseClient
          .from('traffic_data')
          .insert([newTrafficData])

        if (newTrafficError) {
          console.error('Error inserting new traffic data:', newTrafficError)
        }

        packetCount++
      }, 1000) // Generate a new packet every second

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Simulation started successfully',
          initial_packets: initialPackets
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Invalid action specified: ${action}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Error in process-wireshark function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})