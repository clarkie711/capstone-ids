export function generateSimulatedPacket() {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS']
  const ips = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '192.168.0.1', '8.8.8.8', '1.1.1.1']
  
  return {
    timestamp: new Date().toISOString(),
    source_address: ips[Math.floor(Math.random() * ips.length)],
    destination_address: ips[Math.floor(Math.random() * ips.length)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    length: Math.floor(Math.random() * 1500) + 64,
    info: `Simulated ${protocols[Math.floor(Math.random() * protocols.length)]} traffic`
  }
}