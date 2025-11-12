import React from 'react';
import { formatDate } from '../../utils/dashboardData';

const getActivityIcon = (type) => {
  const icons = {
    itinerary: '🗓️',
    tourist: '👤',
    program: '🏞️',
    transport: '🚌',
    default: '🔔',
  };
  return icons[type] || icons.default;
};

const getActionColor = (action) => {
  const colors = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
    completed: 'bg-purple-100 text-purple-700',
    default: 'bg-gray-100 text-gray-700',
  };
  return colors[action] || colors.default;
};

const RecentActivities = ({ activities = [], maxItems = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.slice(0, maxItems).map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-500">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {activities.length === 0 && (
              <li className="py-4 text-center text-sm text-gray-500">
                No hay actividades recientes
              </li>
            )}
          </ul>
        </div>
      </div>
      {activities.length > maxItems && (
        <div className="bg-gray-50 px-6 py-3 text-right text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Ver todo el historial
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
