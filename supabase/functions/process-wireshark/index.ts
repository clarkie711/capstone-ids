import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WiresharkPacket {
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  protocol: string;
  length: number;
  info: string;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const packets: WiresharkPacket[] = await req.json()

    // Process each packet and insert into network_logs
    const processedLogs = packets.map(packet => ({
      timestamp: new Date(packet.timestamp),
      event_type: 'traffic',
      source_ip: packet.source_ip,
      destination_ip: packet.destination_ip,
      protocol: packet.protocol,
      status: 'success',
      message: packet.info,
      metadata: {
        bytes_transferred: packet.length,
        source: 'wireshark'
      }
    }))

    // Batch insert into network_logs
    const { error } = await supabaseClient
      .from('network_logs')
      .insert(processedLogs)

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Packets processed successfully' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})