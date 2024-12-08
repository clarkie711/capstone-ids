import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface IpapiResponse {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
  org?: string;
  timezone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ip } = await req.json()
    console.log('Fetching location for IP:', ip)

    // First try ipapi.co
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data: IpapiResponse = await response.json()
    
    if (data.error) {
      throw new Error('IP API error: ' + data.error)
    }

    const locationData = {
      country: data.country_name,
      city: data.city,
      region: data.region,
      lat: data.latitude,
      lon: data.longitude,
      metadata: {
        source: 'ipapi.co',
        org: data.org,
        timezone: data.timezone
      }
    }

    console.log('Location data retrieved:', locationData)

    return new Response(
      JSON.stringify(locationData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})