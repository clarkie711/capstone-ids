import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Philippine cities with their coordinates
const philippineCities = [
  { city: 'Manila', region: 'Metro Manila', lat: 14.5995, lon: 120.9842 },
  { city: 'Cebu City', region: 'Central Visayas', lat: 10.3157, lon: 123.8854 },
  { city: 'Davao City', region: 'Davao Region', lat: 7.1907, lon: 125.4553 },
  { city: 'Quezon City', region: 'Metro Manila', lat: 14.6760, lon: 121.0437 },
  { city: 'Makati', region: 'Metro Manila', lat: 14.5547, lon: 121.0244 },
  { city: 'Baguio', region: 'Cordillera', lat: 16.4023, lon: 120.5960 }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ip } = await req.json()
    
    // Get a random Philippine city
    const randomCity = philippineCities[Math.floor(Math.random() * philippineCities.length)]
    
    // Add some minor randomization to the coordinates to simulate different locations in the same city
    const latVariation = (Math.random() - 0.5) * 0.01
    const lonVariation = (Math.random() - 0.5) * 0.01
    
    const locationData = {
      country: 'Philippines',
      city: randomCity.city,
      region: randomCity.region,
      lat: randomCity.lat + latVariation,
      lon: randomCity.lon + lonVariation,
      metadata: {
        source: 'Philippine Geolocation Service',
        isp: 'Philippine Internet Provider',
        timezone: 'Asia/Manila',
        org: 'Philippine Network Organization'
      }
    }

    return new Response(
      JSON.stringify(locationData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-ip-location function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})