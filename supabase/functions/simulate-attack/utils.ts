export const generateRandomIP = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
};

export const generateLocation = () => ({
  country: 'Philippines',
  city: ['Manila', 'Cebu', 'Davao', 'Baguio'][Math.floor(Math.random() * 4)],
  coordinates: {
    lat: 14.5995 + (Math.random() - 0.5) * 2,
    lon: 120.9842 + (Math.random() - 0.5) * 2
  }
});

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};