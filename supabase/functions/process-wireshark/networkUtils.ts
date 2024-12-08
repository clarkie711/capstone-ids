export const protocolWeights = {
  HTTP: 30,
  HTTPS: 40,
  DNS: 10,
  TCP: 8,
  UDP: 7,
  ICMP: 5
};

export const commonPorts = {
  HTTP: 80,
  HTTPS: 443,
  DNS: 53,
  SSH: 22,
  FTP: 21,
  SMTP: 25,
  POP3: 110,
  IMAP: 143,
  RDP: 3389,
  MySQL: 3306,
  PostgreSQL: 5432
};

export function generatePrivateIP() {
  console.log('Generating private IP address...');
  const ranges = [
    { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },
    { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
    { start: [172, 16, 0, 0], end: [172, 31, 255, 255] }
  ];
  
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const ip = range.start.map((start, i) => {
    const end = range.end[i];
    return Math.floor(Math.random() * (end - start + 1)) + start;
  }).join('.');
  
  console.log('Generated private IP:', ip);
  return ip;
}

export function generatePublicIP() {
  console.log('Generating public IP address...');
  const nonPrivateRanges = [
    [1, 9], [11, 171], [173, 191], [193, 223]
  ];
  const range = nonPrivateRanges[Math.floor(Math.random() * nonPrivateRanges.length)];
  const ip = [
    Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0],
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ].join('.');
  
  console.log('Generated public IP:', ip);
  return ip;
}