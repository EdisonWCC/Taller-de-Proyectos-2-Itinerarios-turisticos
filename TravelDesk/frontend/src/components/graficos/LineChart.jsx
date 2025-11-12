// LineChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import '../../styles/graficos/graficos.css';
import '../../styles/graficos/line-chart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="line-chart-tooltip">
        <p className="line-chart-tooltip-label">{label}</p>
        <p className="line-chart-tooltip-value">{payload[0].value} itinerarios</p>
      </div>
    );
  }
  return null;
};

const LineChart = ({ title, data, labels, color = '#4F46E5' }) => {
  const chartRef = useRef(null);
  const [hasDimensions, setHasDimensions] = useState(false);

  // Transform data to match Recharts format
  const chartData = React.useMemo(() => {
    return labels.map((label, index) => ({
      name: label,
      value: data && data[index] !== undefined ? data[index] : 0,
    }));
  }, [data, labels]);

  // Calculate average value for reference line
  const average = React.useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;
  }, [chartData]);

  useEffect(() => {
    const checkDimensions = () => {
      if (chartRef.current && chartRef.current.offsetWidth > 0) {
        setHasDimensions(true);
      }
    };

    checkDimensions();
    window.addEventListener('resize', checkDimensions);
    return () => window.removeEventListener('resize', checkDimensions);
  }, []);

  // Verificar si hay datos para mostrar
  const hasData = chartData && chartData.length > 0 && chartData.some(item => item.value > 0);

  return (
    <div 
      ref={chartRef}
      className="chart-container"
    >
      <div className="line-chart-header">
        <h3 className="chart-title">{title}</h3>
        {hasData && (
          <div className="line-chart-legend">
            <span 
              className="line-chart-legend-dot" 
              style={{ backgroundColor: color }}
            />
            <span>Promedio: {average.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="chart-content">
        {!hasData ? (
          <div className="no-data-message">
            No hay datos disponibles para mostrar
          </div>
        ) : hasDimensions ? (
          <div className="line-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="line-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => (Number.isInteger(value) ? value : '')}
                  width={30}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(0, 0, 0, 0.1)', strokeWidth: 1 }}
                />
                <ReferenceLine 
                  y={average}
                  className="reference-line"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fillOpacity={1}
                  fill="url(#line-chart-gradient)"
                  strokeWidth={2}
                  className="chart-area"
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2, 
                    fill: '#fff',
                    stroke: color,
                    className: 'chart-dot'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="loading-state">
            <p className="loading-text">Cargando gráfico...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;