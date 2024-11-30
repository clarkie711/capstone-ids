import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { data: threat } = await req.json()
    const { source_ip, traffic_pattern } = threat

    // Simple threat analysis logic
    const confidenceScore = calculateThreatScore(traffic_pattern)
    const threatType = determineThreatType(traffic_pattern)

    // Insert the threat data
    const { data, error } = await supabaseClient
      .from('network_threats')
      .insert({
        threat_type: threatType,
        source_ip,
        confidence_score: confidenceScore,
        details: traffic_pattern
      })
      .select()
      .single()

    if (error) throw error

    console.log('Threat analyzed:', data)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function calculateThreatScore(pattern: any): number {
  // Implement threat scoring logic based on traffic patterns
  const {
    requestFrequency,
    payloadSize,
    errorRate
  } = pattern

  let score = 0
  if (requestFrequency > 100) score += 0.3
  if (payloadSize > 1000000) score += 0.3
  if (errorRate > 0.1) score += 0.4

  return Math.min(score, 1)
}

function determineThreatType(pattern: any): string {
  // Determine threat type based on traffic patterns
  const {
    requestFrequency,
    payloadSize,
    errorRate
  } = pattern

  if (requestFrequency > 1000) return 'DDoS'
  if (payloadSize > 10000000) return 'Data Exfiltration'
  if (errorRate > 0.5) return 'Brute Force'
  return 'Suspicious Activity'
}