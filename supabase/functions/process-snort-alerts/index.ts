import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SnortAlert {
  signature_id: number
  signature_name: string
  classification?: string
  priority?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  protocol?: string
  source_ip: string
  source_port?: number
  destination_ip: string
  destination_port?: number
  payload?: string
  packet_details?: Record<string, unknown>
  raw_log?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const alertData: SnortAlert = await req.json()
    console.log('Received Snort alert:', alertData)

    // Basic validation
    if (!alertData.signature_id || !alertData.signature_name || !alertData.source_ip || !alertData.destination_ip) {
      throw new Error('Missing required fields in alert data')
    }

    // Insert alert into database
    const { data, error } = await supabaseClient
      .from('snort_alerts')
      .insert([alertData])
      .select()

    if (error) {
      console.error('Error inserting alert:', error)
      throw error
    }

    console.log('Successfully processed alert:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing alert:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})