import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const commonAttackPatterns = [
  {
    type: 'Port Scan (Educational)',
    details: () => ({
      ports_scanned: Math.floor(Math.random() * 1000) + 100,
      scan_type: ['TCP SYN', 'UDP', 'TCP Connect', 'FIN Scan'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.45 + Math.random() * 0.3,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.1',
      protocol: 'TCP',
      port: Math.floor(Math.random() * 65535),
      status: 'warning',
      message: `Port scan activity detected from ${sourceIp}`,
      metadata: { scan_type: ['TCP SYN', 'UDP', 'TCP Connect', 'FIN Scan'][Math.floor(Math.random() * 4)] }
    })
  },
  {
    type: 'Unusual Traffic Pattern',
    details: () => ({
      bandwidth_usage: `${(Math.random() * 10).toFixed(1)}MB/s`,
      duration: `${Math.floor(Math.random() * 300)}s`,
      protocol: ['HTTP', 'HTTPS', 'FTP', 'SSH'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.55 + Math.random() * 0.25,
    generateLog: (sourceIp: string) => ({
      event_type: 'traffic',
      source_ip: sourceIp,
      destination_ip: '10.0.0.1',
      protocol: ['HTTP', 'HTTPS', 'FTP', 'SSH'][Math.floor(Math.random() * 4)],
      port: [80, 443, 21, 22][Math.floor(Math.random() * 4)],
      status: 'warning',
      message: `Unusual traffic pattern detected from ${sourceIp}`,
      metadata: { bandwidth_usage: `${(Math.random() * 10).toFixed(1)}MB/s` }
    })
  },
  {
    type: 'Authentication Attempt',
    details: () => ({
      attempts: Math.floor(Math.random() * 20) + 3,
      interval: `${Math.floor(Math.random() * 10)}min`,
      service: ['SSH', 'FTP', 'Admin Panel', 'Database'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.65 + Math.random() * 0.2,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.100',
      protocol: ['SSH', 'FTP', 'HTTP', 'POSTGRESQL'][Math.floor(Math.random() * 4)],
      port: [22, 21, 80, 5432][Math.floor(Math.random() * 4)],
      status: 'failure',
      message: `Multiple failed authentication attempts from ${sourceIp}`,
      metadata: { attempts: Math.floor(Math.random() * 20) + 3 }
    })
  },
  {
    type: 'DDoS Simulation',
    details: () => ({
      requests_per_second: Math.floor(Math.random() * 1000) + 100,
      attack_vector: ['UDP Flood', 'SYN Flood', 'HTTP Flood', 'DNS Amplification'][Math.floor(Math.random() * 4)],
      duration: `${Math.floor(Math.random() * 60)}s`,
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.75 + Math.random() * 0.2,
    generateLog: (sourceIp: string) => ({
      event_type: 'traffic',
      source_ip: sourceIp,
      destination_ip: '192.168.1.1',
      protocol: ['UDP', 'TCP', 'HTTP', 'DNS'][Math.floor(Math.random() * 4)],
      port: [53, 80, 443][Math.floor(Math.random() * 3)],
      status: 'warning',
      message: `High volume of traffic detected from ${sourceIp}`,
      metadata: { requests_per_second: Math.floor(Math.random() * 1000) + 100 }
    })
  }
];

const generateRandomIP = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

const getRandomLocation = () => {
  const locations = [
    { country: 'United States', city: 'Los Angeles', region: 'California', lat: 34.0522, lon: -118.2437 },
    { country: 'China', city: 'Beijing', region: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { country: 'Russia', city: 'Moscow', region: 'Moscow', lat: 55.7558, lon: 37.6173 },
    { country: 'Germany', city: 'Berlin', region: 'Berlin', lat: 52.5200, lon: 13.4050 },
    { country: 'Brazil', city: 'São Paulo', region: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { country: 'India', city: 'Mumbai', region: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { country: 'United Kingdom', city: 'London', region: 'England', lat: 51.5074, lon: -0.1278 },
    { country: 'Japan', city: 'Tokyo', region: 'Kanto', lat: 35.6762, lon: 139.6503 }
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 2-4 random threats
    const numberOfThreats = Math.floor(Math.random() * 3) + 2;
    const threats = [];
    const logs = [];

    for (let i = 0; i < numberOfThreats; i++) {
      const attackPattern = commonAttackPatterns[Math.floor(Math.random() * commonAttackPatterns.length)];
      const sourceIp = generateRandomIP();
      
      // Create threat
      const threat = {
        threat_type: attackPattern.type,
        source_ip: sourceIp,
        confidence_score: attackPattern.confidence(),
        details: attackPattern.details(),
        location: getRandomLocation(),
        is_false_positive: false,
        detected_at: new Date().toISOString()
      };

      threats.push(threat);

      // Create corresponding log
      const log = attackPattern.generateLog(sourceIp);
      logs.push(log);

      // Add additional connection attempt logs for authentication-related threats
      if (attackPattern.type === 'Authentication Attempt') {
        const attempts = Math.floor(Math.random() * 5) + 2;
        for (let j = 0; j < attempts; j++) {
          logs.push({
            ...attackPattern.generateLog(sourceIp),
            timestamp: new Date(Date.now() - j * 10000).toISOString() // Spread attempts over time
          });
        }
      }
    }

    // Insert threats
    const { error: threatError } = await supabaseClient
      .from('network_threats')
      .insert(threats);

    if (threatError) {
      console.error('Error inserting threats:', threatError);
      throw threatError;
    }

    // Insert logs
    const { error: logError } = await supabaseClient
      .from('network_logs')
      .insert(logs);

    if (logError) {
      console.error('Error inserting logs:', logError);
      throw logError;
    }

    console.log('Successfully simulated threats and logs:', { threats, logs });

    return new Response(
      JSON.stringify({ message: 'Educational simulation completed', threats, logs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in simulate-attack function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});