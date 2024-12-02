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

    const generateRandomIP = () => {
      return `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }

    // Simulate controlled, educational scenarios
    const scenarios = [
      {
        threat_type: 'Port Scan (Educational)',
        source_ip: generateRandomIP(),
        confidence_score: 0.65,
        details: {
          ports_scanned: 5,
          scan_type: 'TCP SYN',
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      },
      {
        threat_type: 'Unusual Traffic Pattern',
        source_ip: generateRandomIP(),
        confidence_score: 0.55,
        details: {
          bandwidth_usage: '2.5MB/s',
          duration: '30s',
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      },
      {
        threat_type: 'Authentication Attempt',
        source_ip: generateRandomIP(),
        confidence_score: 0.45,
        details: {
          attempts: 3,
          interval: '5min',
          timestamp: new Date().toISOString()
        },
        location: await getIpLocation()
      }
    ];

    // Insert controlled scenarios
    for (const scenario of scenarios) {
      const { error } = await supabaseClient
        .from('network_threats')
        .insert(scenario)

      if (error) throw error
      
      console.log(`Simulated ${scenario.threat_type} from ${scenario.source_ip}`)
    }

    return new Response(
      JSON.stringify({ message: 'Educational scenarios simulated', scenarios }),
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