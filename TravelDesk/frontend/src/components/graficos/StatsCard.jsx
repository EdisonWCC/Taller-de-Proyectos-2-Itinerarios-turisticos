import React from 'react';
import { formatNumber } from '../../utils/dashboardData';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'indigo',
  trend = null,
  trendText = ''
}) => {
  // Definir esquemas de colores
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      text: 'text-indigo-700',
      border: 'border-indigo-100'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      text: 'text-green-700',
      border: 'border-green-100'
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      text: 'text-yellow-700',
      border: 'border-yellow-100'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      text: 'text-red-700',
      border: 'border-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      text: 'text-purple-700',
      border: 'border-purple-100'
    }
  };

  const colors = colorSchemes[color] || colorSchemes.indigo;
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className={`statscard-container ${colors.bg} ${colors.border}`}>
      <div className="statscard-content">
        <div className="statscard-info">
          <p className="statscard-title">{title}</p>
          <p className="statscard-value">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          
          {trend !== null && (
            <div className={`statscard-trend ${trendColor}`}>
              <TrendIcon className="statscard-trend-icon" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`statscard-icon ${colors.iconBg} ${colors.iconText}`}>
            {React.cloneElement(icon, { 
              className: 'statscard-main-icon',
              'aria-hidden': 'true'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
