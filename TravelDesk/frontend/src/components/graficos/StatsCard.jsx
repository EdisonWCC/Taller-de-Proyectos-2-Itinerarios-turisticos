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
    <div className={`${colors.bg} rounded-lg p-2 h-full border ${colors.border} transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center justify-between h-full gap-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-gray-500 truncate">{title}</p>
          <p className="text-base font-bold text-gray-900 leading-tight">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          
          {trend !== null && (
            <div className={`inline-flex items-center text-[10px] ${trendColor} mt-0.5`}>
              <TrendIcon className="h-2.5 w-2.5 mr-0.5" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-0.5 rounded-full ${colors.iconBg} ${colors.iconText} flex-shrink-0 flex items-center justify-center`} style={{ width: '20px', height: '20px' }}>
            {React.cloneElement(icon, { 
              className: 'h-2.5 w-2.5',
              'aria-hidden': 'true'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
