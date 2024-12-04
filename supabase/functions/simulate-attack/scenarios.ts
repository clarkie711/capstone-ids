export interface SimulationScenario {
  type: string;
  details: () => any;
  confidence: () => number;
  generateLog: (sourceIp: string) => NetworkLog;
}

export interface NetworkLog {
  event_type: string;
  source_ip: string;
  destination_ip?: string;
  protocol?: string;
  port?: number;
  status: 'success' | 'warning' | 'error';
  message: string;
  metadata?: any;
}

export const educationalScenarios: SimulationScenario[] = [
  {
    type: 'Port Scan (Educational)',
    details: () => ({
      ports_scanned: Math.floor(Math.random() * 1000) + 100,
      scan_type: ['TCP SYN', 'UDP', 'TCP Connect', 'FIN Scan'][Math.floor(Math.random() * 4)],
      educational_note: 'This simulates a network mapping attempt, commonly used in security assessments',
      timestamp: new Date().toISOString()
    }),
    confidence: () => 0.45 + Math.random() * 0.3,
    generateLog: (sourceIp: string): NetworkLog => ({
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
    generateLog: (sourceIp: string): NetworkLog => ({
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
    generateLog: (sourceIp: string): NetworkLog => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.100',
      protocol: 'HTTP',
      port: 443,
      status: 'error',
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
    generateLog: (sourceIp: string): NetworkLog => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.255',
      protocol: 'ARP',
      status: 'warning',
      message: `Educational simulation: ARP spoofing activity detected from ${sourceIp}`,
      metadata: {
        simulation_type: 'arp_spoofing',
        educational_purpose: 'Network layer attack demonstration'
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
    generateLog: (sourceIp: string): NetworkLog => ({
      event_type: 'security',
      source_ip: sourceIp,
      destination_ip: '192.168.1.10',
      protocol: ['TCP', 'UDP', 'HTTP'][Math.floor(Math.random() * 3)],
      port: [80, 443, 8080][Math.floor(Math.random() * 3)],
      status: 'error',
      message: `Educational simulation: High-volume traffic pattern from ${sourceIp}`,
      metadata: {
        simulation_type: 'ddos',
        educational_purpose: 'DDoS detection demonstration'
      }
    })
  }
];