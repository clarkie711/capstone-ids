import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const educationalScenarios = [
  {
    type: 'Port Scan (Educational)',
    details: () => ({
      ports_scanned: Math.floor(Math.random() * 1000) + 100,
      scan_type: ['TCP SYN', 'UDP', 'TCP Connect', 'FIN Scan'][Math.floor(Math.random() * 4)],
      educational_note: 'This simulates a network mapping attempt, commonly used in security assessments',
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
      message: `Educational simulation: Port scan activity detected from ${sourceIp}`,
      metadata: {
        simulation_type: 'port_scan',
        educational_purpose: 'Network mapping detection demonstration'
      }
    })
  },
  {
    type: 'Traffic Pattern Analysis (Educational)',
    details: () => ({
      bandwidth_usage: `${(Math.random() * 10).toFixed(1)}MB/s`,
      duration: `${Math.floor(Math.random() * 300)}s`,
      pattern_type: ['Sudden Spike', 'Gradual Increase', 'Irregular Pattern'][Math.floor(Math.random() * 3)],
      educational_note: 'Demonstrates traffic pattern analysis capabilities',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.55 + Math.random() * 0.25,
    generateLog: (sourceIp: string) => ({
      event_type: 'traffic',
      source_ip: sourceIp,
      destination_ip: '10.0.0.1',
      protocol: 'HTTP',
      port: 80,
      status: 'warning',
      message: `Educational simulation: Unusual traffic pattern analysis from ${sourceIp}`,
      metadata: {
        simulation_type: 'traffic_analysis',
        educational_purpose: 'Traffic pattern monitoring demonstration'
      }
    })
  },
  {
    type: 'Authentication Analysis (Educational)',
    details: () => ({
      attempts: Math.floor(Math.random() * 20) + 3,
      interval: `${Math.floor(Math.random() * 10)}min`,
      pattern: ['Distributed', 'Sequential', 'Random'][Math.floor(Math.random() * 3)],
      educational_note: 'Shows authentication attempt pattern analysis',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.65 + Math.random() * 0.2,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.100',
      protocol: 'HTTP',
      port: 443,
      status: 'failure',
      message: `Educational simulation: Authentication pattern analysis from ${sourceIp}`,
      metadata: {
        simulation_type: 'auth_analysis',
        educational_purpose: 'Authentication monitoring demonstration'
      }
    })
  }
];

const generateRandomIP = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

const getRandomLocation = () => {
  const locations = [
    { country: 'Philippines', city: 'Manila', region: 'NCR', lat: 14.5995, lon: 120.9842 },
    { country: 'Philippines', city: 'Cebu', region: 'Central Visayas', lat: 10.3157, lon: 123.8854 },
    { country: 'Philippines', city: 'Davao', region: 'Davao Region', lat: 7.1907, lon: 125.4553 },
    { country: 'Philippines', city: 'Baguio', region: 'CAR', lat: 16.4023, lon: 120.5960 }
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

    // Generate 2-4 random scenarios
    const numberOfScenarios = Math.floor(Math.random() * 3) + 2;
    const threats = [];
    const logs = [];

    for (let i = 0; i < numberOfScenarios; i++) {
      const scenario = educationalScenarios[Math.floor(Math.random() * educationalScenarios.length)];
      const sourceIp = generateRandomIP();
      
      // Create threat
      const threat = {
        threat_type: scenario.type,
        source_ip: sourceIp,
        confidence_score: scenario.confidence(),
        details: scenario.details(),
        location: getRandomLocation(),
        is_false_positive: false,
        detected_at: new Date().toISOString()
      };

      threats.push(threat);

      // Create corresponding log
      const log = scenario.generateLog(sourceIp);
      logs.push(log);

      // Add additional context logs
      const contextLog = {
        event_type: 'system',
        source_ip: sourceIp,
        status: 'success',
        message: `Educational simulation context: ${scenario.type}`,
        metadata: {
          simulation_id: `sim_${Date.now()}`,
          scenario_type: scenario.type,
          educational_purpose: 'Capstone demonstration'
        },
        timestamp: new Date().toISOString()
      };
      logs.push(contextLog);
    }

    // Insert threats
    const { error: threatError } = await supabaseClient
      .from('network_threats')
      .insert(threats);

    if (threatError) throw threatError;

    // Insert logs
    const { error: logError } = await supabaseClient
      .from('network_logs')
      .insert(logs);

    if (logError) throw logError;

    return new Response(
      JSON.stringify({
        message: 'Educational simulation completed successfully',
        scenarios: threats.length,
        logs: logs.length
      }),
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