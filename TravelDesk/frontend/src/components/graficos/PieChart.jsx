// PieChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import '../../styles/graficos/graficos.css';
import '../../styles/graficos/pie-chart.css';

const RADIAN = Math.PI / 180;

// Componente para renderizar etiquetas personalizadas
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const percentage = (percent * 100).toFixed(0);

  // Solo mostrar porcentaje si es mayor al 5% para evitar superposición
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      className="pie-label"
      style={{
        fontSize: outerRadius * 0.15,
        fontWeight: 600,
        filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))',
        pointerEvents: 'none'
      }}
    >
      {`${percentage}%`}
    </text>
  );
};

// Componente para el tooltip personalizado
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="pie-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-value">{data.value}%</p>
      </div>
    );
  }
  return null;
};

// Componente para la leyenda personalizada
const CustomLegend = ({ payload }) => {
  return (
    <div className="pie-legend">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="legend-item">
          <span 
            className="legend-color" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="legend-text">
            {entry.value}
            <span className="legend-percentage">
              {` (${Math.round(entry.payload.percent * 100)}%)`}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ 
  title, 
  data = [], 
  innerRadius = 0, 
  outerRadius = 80, 
  centerText = '',
  colors = ['#4F46E5', '#10B981', '#F59E0B', '#F97316', '#8B5CF6', '#EC4899'] 
}) => {
  const chartRef = useRef(null);
  const [hasDimensions, setHasDimensions] = useState(false);

  // If data is an array of objects with name/value, use it directly
  // Otherwise, assume it's an array of values and create the structure
  const chartData = Array.isArray(data) && data.length > 0 
    ? data.map((item, index) => ({
        ...item,
        color: item.color || colors[index % colors.length]
      }))
    : [];

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

  if (!hasDimensions) {
    return (
      <div className="piechart-loading-container">
        <div className="piechart-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef}
      className="piechart-container"
      style={{ minHeight: '300px' }}
    >
      {title && <h3 className="piechart-title">{title}</h3>}
      <div className="piechart-content">
        <div className="piechart-wrapper">
          <ResponsiveContainer width="100%" height="100%" className="piechart-responsive">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={outerRadius + '%'}
                innerRadius={innerRadius + '%'}
                paddingAngle={2}
                dataKey="value"
                className="pie-slice"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={1}
                    className="pie-slice"
                  />
                ))}
                {centerText && (
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-medium text-gray-600"
                  >
                    {centerText}
                  </text>
                )}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Legend 
                content={<CustomLegend />}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PieChart;