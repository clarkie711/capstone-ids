import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { educationalScenarios } from './scenarios.ts'
import { generateRandomIP, generateLocation, corsHeaders } from './utils.ts'

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
        location: generateLocation(),
        is_false_positive: false,
        detected_at: new Date().toISOString()
      };

      threats.push(threat);

      // Create corresponding log
      const log = scenario.generateLog(sourceIp);
      logs.push(log);

      // Add additional context logs with valid status
      const contextLog = {
        event_type: 'system',
        source_ip: sourceIp,
        status: 'success', // Using a valid status value
        message: `Educational simulation context: ${scenario.type}`,
        metadata: {
          simulation_id: `sim_${Date.now()}`,
          scenario_type: scenario.type,
          educational_purpose: 'Capstone demonstration'
        }
      };
      logs.push(contextLog);
    }

    console.log('Inserting threats:', threats);
    console.log('Inserting logs:', logs);

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