import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import './AdminPanel.css';

// Mock data - Replace with actual API calls
const getDashboardData = async () => {
  // This would be an API call in a real app
  return {
    reservationsByStatus: [
      { name: 'Confirmado', value: 45 },
      { name: 'Pendiente', value: 30 },
      { name: 'Cancelado', value: 15 },
      { name: 'Completado', value: 60 },
    ],
    monthlyBookings: [
      { month: 'Ene', bookings: 12 },
      { month: 'Feb', bookings: 19 },
      { month: 'Mar', bookings: 15 },
      { month: 'Abr', bookings: 28 },
      { month: 'May', bookings: 32 },
      { month: 'Jun', bookings: 45 },
    ],
    touristNationalities: [
      { country: 'Perú', count: 45 },
      { country: 'EE.UU.', count: 32 },
      { country: 'España', count: 28 },
      { country: 'México', count: 22 },
      { country: 'Chile', count: 18 },
    ],
    revenueByType: [
      { month: 'Ene', tour: 4000, actividad: 2400, machupicchu: 2400 },
      { month: 'Feb', tour: 3000, actividad: 1398, machupicchu: 2210 },
      { month: 'Mar', tour: 2000, actividad: 9800, machupicchu: 2290 },
      { month: 'Abr', tour: 2780, actividad: 3908, machupicchu: 2000 },
      { month: 'May', tour: 1890, actividad: 4800, machupicchu: 2181 },
      { month: 'Jun', tour: 2390, actividad: 3800, machupicchu: 2500 },
    ]
  };
};

function AdminPanel() {
  // Datos de ejemplo
  const [dashboardData, setDashboardData] = useState({
    reservationsByStatus: [],
    monthlyBookings: [],
    touristNationalities: [],
    revenueByType: []
  });
  
  const [loading, setLoading] = useState(true);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#666" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const [dateRange, setDateRange] = useState('month');
  const [hasDimensions, setHasDimensions] = useState(false);
  const [lastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <header className="admin-header admin-panel-header">
        <div>
          <h1 className="admin-title">Panel de Control</h1>
        </div>
      </header>
      
      {/* Tarjetas de Métricas */}
      <div className="metrics-grid">
        {/* Total de Turistas */}
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#4F46E5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Total de Turistas</p>
            <p className="metric-value">1,248</p>
            <p className="metric-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>12% vs mes anterior</span>
            </p>
          </div>
        </div>

        {/* Itinerarios Activos */}
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#10B981">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Itinerarios Activos</p>
            <p className="metric-value">24</p>
            <p className="metric-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>8% vs mes anterior</span>
            </p>
          </div>
        </div>

        {/* Ingresos Mensuales */}
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#F59E0B">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Ingresos Mensuales</p>
            <p className="metric-value">S/ 48,750</p>
            <p className="metric-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>15% vs mes anterior</span>
            </p>
          </div>
        </div>

        {/* Notificaciones Pendientes */}
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#EF4444">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Notificaciones</p>
            <p className="metric-value">5</p>
            <p className="metric-trend negative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>2 nuevas hoy</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="main-grid">
        {/* Chart 1: Reservations by Status */}
        <div className="chart-container one-third">
          <div className="chart-header">
            <h3 className="chart-title">
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Estado de Reservas
            </h3>
            <p className="chart-description">Distribución de reservas por estado</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.reservationsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.reservationsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Bookings */}
        <div className="chart-container one-third">
          <div className="chart-header">
            <h3 className="chart-title">
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservas Mensuales
            </h3>
            <p className="chart-description">Tendencia de reservas por mes</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" name="Reservas" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Tourist Nationalities */}
        <div className="chart-container one-third">
          <div className="chart-header">
            <h3 className="chart-title">
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nacionalidades de Turistas
            </h3>
            <p className="chart-description">Distribución por país de origen</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={dashboardData.touristNationalities}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Número de Turistas" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Revenue by Program Type */}
        <div className="chart-container full-width" style={{ marginTop: '1rem' }}>
          <div className="chart-header">
            <h3 className="chart-title">
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ingresos por Tipo de Programa
            </h3>
            <p className="chart-description">Tendencia de ingresos por categoría</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.revenueByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tour" name="Tours" stroke="#4F46E5" strokeWidth={2} />
                <Line type="monotone" dataKey="actividad" name="Actividades" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="machupicchu" name="Machu Picchu" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="admin-footer">
        <p>Última actualización: {lastUpdated.toLocaleString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </footer>
    </div>
  );
}

export default AdminPanel;