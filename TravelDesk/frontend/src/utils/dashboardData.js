export const API_ENDPOINTS = {
  STATS: '/api/dashboard/stats',
  ITINERARY_TREND: '/api/dashboard/itinerary-trend',
  PROGRAM_DISTRIBUTION: '/api/dashboard/program-distribution',
  TOURIST_DEMOGRAPHICS: '/api/dashboard/tourist-demographics',
  RECENT_ACTIVITIES: '/api/dashboard/recent-activities',
  REVENUE_BY_TYPE: '/api/dashboard/revenue-by-type',
};

const apiBase = import.meta?.env?.VITE_API_BASE || '';

const getToken = () => {
  try {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.token || '';
  } catch {
    return '';
  }
};

const doFetch = async (path, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const url = `${apiBase}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('API error');
  return res.json();
};

export const getStats = (params) => doFetch(API_ENDPOINTS.STATS, params);
export const getItineraryTrend = (params) => doFetch(API_ENDPOINTS.ITINERARY_TREND, params);
export const getProgramDistribution = (params) => doFetch(API_ENDPOINTS.PROGRAM_DISTRIBUTION, params);
export const getTouristDemographics = (params) => doFetch(API_ENDPOINTS.TOURIST_DEMOGRAPHICS, params);
export const getRecentActivities = (params) => doFetch(API_ENDPOINTS.RECENT_ACTIVITIES, params);
export const getRevenueByType = (params) => doFetch(API_ENDPOINTS.REVENUE_BY_TYPE, params);

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-PE').format(num);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get color based on status
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
