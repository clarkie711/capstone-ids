export const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'critical':
      return 'text-red-500';
    case 'high':
      return 'text-orange-500';
    case 'medium':
      return 'text-yellow-500';
    default:
      return 'text-blue-500';
  }
};