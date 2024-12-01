import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getIpLocation() {
  // Generate random coordinates for simulation
  const locations = [
    {
      country: 'United States',
      city: 'Los Angeles',
      region: 'California',
      lat: 34.0522,
      lon: -118.2437
    },
    {
      country: 'United Kingdom',
      city: 'London',
      region: 'England',
      lat: 51.5074,
      lon: -0.1278
    },
    {
      country: 'Japan',
      city: 'Tokyo',
      region: 'Kanto',
      lat: 35.6762,
      lon: 139.6503
    }
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
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

    // Generate random IP addresses for simulation
    const generateRandomIP = () => {
      return Array.from({ length: 4 }, () => 
        Math.floor(Math.random() * 256)
      ).join('.')
    }

    // Simulate different types of attacks
    const attacks = await Promise.all([
      {
        threat_type: 'DDoS',
        source_ip: generateRandomIP(),
        confidence_score: 0.85,
        details: {
          requestFrequency: 1500,
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      },
      {
        threat_type: 'Data Exfiltration',
        source_ip: generateRandomIP(),
        confidence_score: 0.75,
        details: {
          payloadSize: 15000000, // 15MB
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      },
      {
        threat_type: 'Brute Force',
        source_ip: generateRandomIP(),
        confidence_score: 0.95,
        details: {
          errorRate: 0.8,
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      }
    ]);

    // Insert simulated attacks
    for (const attack of attacks) {
      const { error } = await supabaseClient
        .from('network_threats')
        .insert(attack)

      if (error) throw error
      
      console.log(`Simulated ${attack.threat_type} attack from ${attack.source_ip} in ${attack.location.city}, ${attack.location.country}`)
    }

    return new Response(
      JSON.stringify({ message: 'Attack simulation completed', attacks }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})