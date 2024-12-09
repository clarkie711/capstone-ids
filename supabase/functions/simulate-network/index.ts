import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateSimulatedPacket() {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS']
  const generateIP = () => {
    const octet = () => Math.floor(Math.random() * 256)
    return `${octet()}.${octet()}.${octet()}.${octet()}`
  }
  
  const sourceAddress = generateIP()
  const destinationAddress = generateIP()
  const protocol = protocols[Math.floor(Math.random() * protocols.length)]
  const length = Math.floor(Math.random() * 1500) + 64
  
  return {
    timestamp: new Date().toISOString(),
    source_address: sourceAddress,
    destination_address: destinationAddress,
    protocol,
    length,
    info: `${protocol} traffic from ${sourceAddress} to ${destinationAddress}`
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting network simulation...')
    
    // Generate initial packets
    const initialPackets = Array.from({ length: 10 }, () => generateSimulatedPacket())
    console.log('Generated initial packets:', initialPackets)

    // Store initial packets
    const { error: insertError } = await supabaseClient
      .from('network_traffic_logs')
      .insert(initialPackets)

    if (insertError) {
      console.error('Error inserting initial packets:', insertError)
      throw insertError
    }

    // Generate initial traffic data
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

    // Set up periodic packet generation (5 minutes)
    let packetCount = 0
    const maxPackets = 300 // 5 minutes * 60 seconds = 300 packets
    
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
    }, 1000)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Network simulation started successfully',
        initial_packets: initialPackets
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in network simulation:', error)
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