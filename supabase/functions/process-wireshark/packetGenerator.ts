import { networkUtils } from './networkUtils.ts'

export function generateSimulatedPacket() {
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS']
  const sourceAddress = networkUtils.generateRandomIP()
  const destinationAddress = networkUtils.generateRandomIP()
  const protocol = protocols[Math.floor(Math.random() * protocols.length)]
  const length = Math.floor(Math.random() * 1500) + 64 // Typical packet sizes between 64 and 1564 bytes
  
  return {
    timestamp: new Date().toISOString(),
    source_address: sourceAddress,
    destination_address: destinationAddress,
    protocol,
    length,
    info: `Simulated ${protocol} traffic from ${sourceAddress} to ${destinationAddress}`
  }
}