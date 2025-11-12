// API endpoints for dashboard data
export const API_ENDPOINTS = {
  STATS: '/api/dashboard/stats',
  ITINERARY_TREND: '/api/dashboard/itinerary-trend',
  PROGRAM_DISTRIBUTION: '/api/dashboard/program-distribution',
  TOURIST_DEMOGRAPHICS: '/api/dashboard/tourist-demographics',
  RECENT_ACTIVITIES: '/api/dashboard/recent-activities',
};

// Mock data for development
const MOCK_DATA = {
  stats: {
    totalItineraries: 45,
    activeItineraries: 28,
    totalTourists: 156,
    totalPrograms: 89,
    revenue: 12500,
  },
  itineraryTrend: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    data: [12, 15, 8, 18, 22, 19, 25],
  },
  programDistribution: {
    labels: ['Tours', 'Actividades', 'Machu Picchu'],
    data: [45, 30, 25],
    colors: ['#4F46E5', '#10B981', '#F59E0B'],
  },
  touristDemographics: {
    labels: ['EE.UU.', 'Reino Unido', 'Francia', 'Alemania', 'Canadá', 'Otros'],
    data: [35, 25, 15, 10, 8, 7],
  },
  recentActivities: [
    { id: 1, type: 'itinerary', action: 'created', title: 'Tour por el Valle Sagrado', date: '2025-11-10T10:30:00' },
    { id: 2, type: 'tourist', action: 'updated', title: 'María González', date: '2025-11-09T16:45:00' },
    { id: 3, type: 'program', action: 'created', title: 'Visita a Machu Picchu', date: '2025-11-09T09:15:00' },
  ],
};

export const fetchDashboardData = async (endpoint) => {
  try {
    // In a real app, you would make an API call here
    // const response = await fetch(API_ENDPOINTS[endpoint]);
    // return await response.json();
    
    // For now, return mock data
    switch (endpoint) {
      case 'stats':
        return MOCK_DATA.stats;
      case 'itinerary-trend':
        return MOCK_DATA.itineraryTrend;
      case 'program-distribution':
        return MOCK_DATA.programDistribution;
      case 'tourist-demographics':
        return MOCK_DATA.touristDemographics;
      case 'recent-activities':
        return MOCK_DATA.recentActivities;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
};

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
