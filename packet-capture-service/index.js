import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Configure tshark options
const networkInterface = process.env.INTERFACE || 'eth0';
const tsharkPath = '/usr/bin/tshark';
const tsharkArgs = [
  '-i', networkInterface,
  '-T', 'ek',  // Elastic Search format (JSON)
  '-l'         // Line-buffered mode
];

console.log(`Starting packet capture on interface ${networkInterface}...`);

// Start tshark process
const tshark = spawn(tsharkPath, tsharkArgs);

// Handle tshark output
tshark.stdout.on('data', async (data) => {
  try {
    // Parse the JSON data
    const packets = data.toString().split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    for (const packet of packets) {
      const layers = packet.layers;
      
      // Extract relevant packet information
      const packetData = {
        timestamp: new Date().toISOString(),
        source_address: layers?.ip?.ip_src?.[0] || layers?.eth?.eth_src?.[0] || 'unknown',
        destination_address: layers?.ip?.ip_dst?.[0] || layers?.eth?.eth_dst?.[0] || 'unknown',
        protocol: layers?.frame?.frame_protocols?.[0]?.split(':').pop() || 'unknown',
        length: parseInt(layers?.frame?.frame_len?.[0]) || 0,
        info: `${layers?.frame?.frame_protocols?.[0]} communication`
      };

      // Insert packet data into Supabase
      const { error } = await supabase
        .from('network_traffic_logs')
        .insert(packetData);

      if (error) {
        console.error('Error inserting packet data:', error);
      } else {
        console.log('Packet data inserted successfully:', packetData);
      }
    }
  } catch (error) {
    console.error('Error processing packet:', error);
  }
});

// Handle errors
tshark.stderr.on('data', (data) => {
  console.error(`tshark error: ${data}`);
});

tshark.on('close', (code) => {
  console.log(`tshark process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping packet capture...');
  tshark.kill();
  process.exit();
});