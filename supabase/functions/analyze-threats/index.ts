import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getIpLocationFromIpApi(ip: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`);
    const data = await response.json();
    if (data.status === 'success') {
      return {
        source: 'ip-api',
        country: data.country,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        region: data.regionName,
        isp: data.isp,
        org: data.org,
        proxy: data.proxy,
        hosting: data.hosting,
        timezone: data.timezone
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching from IP-API:', error);
    return null;
  }
}

async function getIpLocationFromIpinfo(ip: string) {
  try {
    // Note: In production, you should use an API token
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await response.json();
    if (data.ip) {
      const [lat, lon] = (data.loc || '').split(',').map(Number);
      return {
        source: 'ipinfo',
        country: data.country,
        city: data.city,
        lat: lat || null,
        lon: lon || null,
        region: data.region,
        org: data.org,
        timezone: data.timezone
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching from IPinfo:', error);
    return null;
  }
}

async function getIpLocation(ip: string) {
  console.log('Fetching location data for IP:', ip);
  
  // Try IP-API first
  let locationData = await getIpLocationFromIpApi(ip);
  
  // If IP-API fails, try IPinfo as fallback
  if (!locationData) {
    console.log('IP-API failed, trying IPinfo...');
    locationData = await getIpLocationFromIpinfo(ip);
  }

  if (!locationData) {
    console.log('All location services failed for IP:', ip);
    return null;
  }

  console.log('Successfully retrieved location data from:', locationData.source);
  
  // Return standardized location object with enhanced data
  return {
    country: locationData.country,
    city: locationData.city,
    lat: locationData.lat,
    lon: locationData.lon,
    region: locationData.region,
    metadata: {
      source: locationData.source,
      isp: locationData.isp,
      org: locationData.org,
      proxy: locationData.proxy,
      hosting: locationData.hosting,
      timezone: locationData.timezone
    }
  };
}

function calculateThreatScore(pattern: any): number {
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
    
    // Enhanced location fetching with fallback
    const location = await getIpLocation(source_ip)
    console.log('Final location data:', location);

    // Insert the threat data with enhanced location
    const { data, error } = await supabaseClient
      .from('network_threats')
      .insert({
        threat_type: threatType,
        source_ip,
        confidence_score: confidenceScore,
        details: {
          ...traffic_pattern,
          location_metadata: location?.metadata // Store additional location metadata
        },
        location: location ? {
          country: location.country,
          city: location.city,
          lat: location.lat,
          lon: location.lon,
          region: location.region
        } : null
      })
      .select()
      .single()

    if (error) throw error

    console.log('Threat analyzed and stored:', data)

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
