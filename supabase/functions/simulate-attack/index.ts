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
    type: 'DNS Tunneling (Educational)',
    details: () => ({
      query_count: Math.floor(Math.random() * 50) + 20,
      data_size: `${(Math.random() * 5).toFixed(2)}MB`,
      domain_pattern: ['Base64 encoded', 'Hex encoded', 'Custom encoding'][Math.floor(Math.random() * 3)],
      educational_note: 'Demonstrates detection of data exfiltration through DNS queries',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.60 + Math.random() * 0.25,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '8.8.8.8',
      protocol: 'UDP',
      port: 53,
      status: 'warning',
      message: `Educational simulation: Unusual DNS query patterns from ${sourceIp}`,
      metadata: {
        simulation_type: 'dns_tunneling',
        educational_purpose: 'Data exfiltration detection demonstration'
      }
    })
  },
  {
    type: 'SQL Injection Attempt (Educational)',
    details: () => ({
      target_endpoint: ['/login', '/search', '/api/users'][Math.floor(Math.random() * 3)],
      payload_type: ['Union-based', 'Error-based', 'Boolean-based', 'Time-based'][Math.floor(Math.random() * 4)],
      attempts: Math.floor(Math.random() * 10) + 3,
      educational_note: 'Shows detection of SQL injection attempts',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.75 + Math.random() * 0.2,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.100',
      protocol: 'HTTP',
      port: 443,
      status: 'blocked',
      message: `Educational simulation: SQL injection pattern detected from ${sourceIp}`,
      metadata: {
        simulation_type: 'sql_injection',
        educational_purpose: 'Web attack detection demonstration'
      }
    })
  },
  {
    type: 'ARP Spoofing (Educational)',
    details: () => ({
      spoofed_mac: Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
      target_hosts: Math.floor(Math.random() * 5) + 2,
      duration: `${Math.floor(Math.random() * 300)}s`,
      educational_note: 'Demonstrates detection of ARP-based attacks',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.70 + Math.random() * 0.25,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.255',
      protocol: 'ARP',
      status: 'alert',
      message: `Educational simulation: ARP spoofing activity detected from ${sourceIp}`,
      metadata: {
        simulation_type: 'arp_spoofing',
        educational_purpose: 'Network layer attack detection demonstration'
      }
    })
  },
  {
    type: 'DDoS Simulation (Educational)',
    details: () => ({
      traffic_type: ['SYN Flood', 'UDP Flood', 'HTTP Flood'][Math.floor(Math.random() * 3)],
      packets_per_second: Math.floor(Math.random() * 10000) + 1000,
      bandwidth: `${(Math.random() * 100).toFixed(2)}Mbps`,
      educational_note: 'Shows DDoS attack pattern detection',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.80 + Math.random() * 0.15,
    generateLog: (sourceIp: string) => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.10',
      protocol: ['TCP', 'UDP', 'HTTP'][Math.floor(Math.random() * 3)],
      port: [80, 443, 8080][Math.floor(Math.random() * 3)],
      status: 'critical',
      message: `Educational simulation: High-volume traffic pattern from ${sourceIp}`,
      metadata: {
        simulation_type: 'ddos',
        educational_purpose: 'DDoS detection demonstration'
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

    // Randomly select scenarios without repetition
    const availableScenarios = [...educationalScenarios];
    for (let i = 0; i < numberOfScenarios; i++) {
      const scenarioIndex = Math.floor(Math.random() * availableScenarios.length);
      const scenario = availableScenarios.splice(scenarioIndex, 1)[0];
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