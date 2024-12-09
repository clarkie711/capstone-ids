export const networkUtils = {
  generateRandomIP: () => {
    // Generate a random IP address
    const octet = () => Math.floor(Math.random() * 256)
    return `${octet()}.${octet()}.${octet()}.${octet()}`
  }
}