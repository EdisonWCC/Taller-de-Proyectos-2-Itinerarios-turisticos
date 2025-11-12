// BarChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import '../../styles/graficos/graficos.css';
import '../../styles/graficos/bar-chart.css';

// Componente para el tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bar-chart-tooltip">
        <p className="bar-chart-tooltip-label">{label}</p>
        <p className="bar-chart-tooltip-value">{payload[0].value} turistas</p>
      </div>
    );
  }
  return null;
};

// Componente para las etiquetas personalizadas
const CustomLabel = ({ x, y, width, height, value }) => {
  if (!value) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#6B7280"
      fontSize={12}
      textAnchor="middle"
      dominantBaseline="bottom"
    >
      {value}
    </text>
  );
};

const BarChart = ({ 
  title, 
  data = [], 
  color = '#10B981',
  horizontal = false 
}) => {
  const chartRef = useRef(null);
  const [hasDimensions, setHasDimensions] = useState(false);

  // If data is an array of objects with name/value, use it directly
  // Otherwise, assume it's an array of values and create the structure
  const chartData = Array.isArray(data) && data.length > 0 && data[0]?.name !== undefined
    ? data
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bar-chart-container w-full h-full min-h-[300px]" ref={chartRef}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-wrapper w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              className="bar-chart-grid"
              strokeDasharray="3 3" 
              vertical={!horizontal}
              horizontal={horizontal}
            />
            {horizontal ? (
              <>
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  className="bar-chart-axis"
                  width={120}
                />
                <XAxis 
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                  className="bar-chart-axis"
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  className="bar-chart-axis"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="bar-chart-axis"
                />
              </>
            )}
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]} 
              className="bar"
            >
              {chartData.map((entry, index) => {
                // Crear gradiente de color para cada barra
                const colorValue = color || '#10B981';
                const opacity = 0.8 - (index * 0.1);
                const barColor = `${colorValue}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
                
                return (
                  <Cell 
                    key={`cell-${index}`}
                    fill={barColor}
                    stroke="#ffffff"
                    strokeWidth={1}
                    className="bar"
                  />
                );
              })}
              <LabelList
                dataKey="value"
                content={<CustomLabel />}
              />
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;