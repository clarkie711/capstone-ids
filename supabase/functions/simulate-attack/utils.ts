export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const generateRandomIP = () => {
  // Generate random IP addresses that look like they're from the Philippines
  const philippineIPRanges = [
    // PLDT
    { start: '120.28.0.0', end: '120.28.255.255' },
    // Globe Telecom
    { start: '116.93.0.0', end: '116.93.255.255' },
    // Smart Communications
    { start: '203.87.0.0', end: '203.87.255.255' }
  ];

  const range = philippineIPRanges[Math.floor(Math.random() * philippineIPRanges.length)];
  const ip = range.start.split('.').map((octet, index) => {
    if (index === 3) {
      return Math.floor(Math.random() * 256);
    }
    return octet;
  }).join('.');

  return ip;
};

export const generateLocation = () => {
  const cities = [
    { city: 'Manila', region: 'Metro Manila', lat: 14.5995, lon: 120.9842 },
    { city: 'Cebu City', region: 'Central Visayas', lat: 10.3157, lon: 123.8854 },
    { city: 'Davao City', region: 'Davao Region', lat: 7.1907, lon: 125.4553 },
    { city: 'Quezon City', region: 'Metro Manila', lat: 14.6760, lon: 121.0437 },
    { city: 'Makati', region: 'Metro Manila', lat: 14.5547, lon: 121.0244 },
    { city: 'Baguio', region: 'Cordillera', lat: 16.4023, lon: 120.5960 }
  ];

  const selectedCity = cities[Math.floor(Math.random() * cities.length)];
  
  // Add small random variations to coordinates
  const latVariation = (Math.random() - 0.5) * 0.01;
  const lonVariation = (Math.random() - 0.5) * 0.01;

  return {
    country: 'Philippines',
    city: selectedCity.city,
    region: selectedCity.region,
    lat: selectedCity.lat + latVariation,
    lon: selectedCity.lon + lonVariation,
    metadata: {
      source: 'Philippine Geolocation Service',
      isp: 'Philippine Internet Provider',
      timezone: 'Asia/Manila',
      org: 'Philippine Network Organization'
    }
  };
};