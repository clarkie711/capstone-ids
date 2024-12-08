import { protocolWeights, commonPorts, generatePrivateIP, generatePublicIP } from './networkUtils.ts';

function selectWeightedProtocol() {
  const total = Object.values(protocolWeights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  
  for (const [protocol, weight] of Object.entries(protocolWeights)) {
    random -= weight;
    if (random <= 0) return protocol;
  }
  return 'TCP';
}

function generatePacketInfo(protocol: string, srcPort: number, dstPort: number) {
  const templates = {
    HTTP: [
      `GET /api/v1/users HTTP/1.1`,
      `POST /api/v1/data HTTP/1.1`,
      `PUT /api/v1/update HTTP/1.1`,
      `DELETE /api/v1/resource HTTP/1.1`
    ],
    HTTPS: [
      `TLSv1.2 Application Data`,
      `TLSv1.3 Handshake`,
      `Client Hello`,
      `Server Hello`
    ],
    DNS: [
      `Standard query A example.com`,
      `Standard query AAAA example.com`,
      `Standard query response A 93.184.216.34`,
      `Standard query MX example.com`
    ],
    TCP: [
      `[SYN] Seq=0 Win=64240`,
      `[ACK] Seq=1 Ack=1 Win=64240`,
      `[FIN, ACK] Seq=100 Ack=50`,
      `[RST] Seq=1000`
    ],
    UDP: [
      `Length=50`,
      `Length=100`,
      `SSDP Notify`,
      `MDNS Query`
    ],
    ICMP: [
      `Echo (ping) request`,
      `Echo (ping) reply`,
      `Destination unreachable`,
      `Time exceeded`
    ]
  };

  const template = templates[protocol as keyof typeof templates] || templates.TCP;
  return `${srcPort} → ${dstPort} ${template[Math.floor(Math.random() * template.length)]}`;
}

export function generateSimulatedPacket() {
  const protocol = selectWeightedProtocol();
  const sourcePort = Math.floor(Math.random() * 65535);
  const destPort = commonPorts[protocol as keyof typeof commonPorts] || Math.floor(Math.random() * 65535);
  
  const isInternalToExternal = Math.random() < 0.7;
  
  return {
    source_address: isInternalToExternal ? generatePrivateIP() : generatePublicIP(),
    destination_address: isInternalToExternal ? generatePublicIP() : generatePrivateIP(),
    protocol,
    length: Math.floor(Math.random() * (1500 - 64)) + 64,
    info: generatePacketInfo(protocol, sourcePort, destPort),
  };
}