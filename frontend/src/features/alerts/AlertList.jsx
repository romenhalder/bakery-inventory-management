import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAlerts,
  fetchUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
} from './alertSlice';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellAlertIcon,
  CalendarIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const AlertList = () => {
  const dispatch = useDispatch();
  const { alerts, unreadAlerts, unreadCount, loading } = useSelector((state) => state.alerts);
  const [filter, setFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    dispatch(fetchAlerts());
    dispatch(fetchUnreadAlerts());
  }, [dispatch]);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !alert.isRead;
    if (filter === 'READ') return alert.isRead;
    if (filter === 'UNRESOLVED') return !alert.isResolved;
    return alert.alertType === filter;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'OUT_OF_STOCK':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'EXPIRING_SOON':
        return <CalendarIcon className="h-6 w-6 text-orange-500" />;
      case 'EXPIRED':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'REORDER_POINT':
        return <BellAlertIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return 'bg-yellow-50 border-yellow-200';
      case 'OUT_OF_STOCK':
        return 'bg-red-50 border-red-200';
      case 'EXPIRING_SOON':
        return 'bg-orange-50 border-orange-200';
      case 'EXPIRED':
        return 'bg-red-100 border-red-300';
      case 'REORDER_POINT':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = (alertId) => {
    dispatch(markAlertAsRead(alertId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAlertsAsRead());
  };

  const handleDelete = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      dispatch(deleteAlert(alertId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">Alerts</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'No new alerts'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary flex items-center space-x-2"
          >
            <CheckIcon className="h-5 w-5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-2">
        {[
          { value: 'ALL', label: 'All Alerts' },
          { value: 'UNREAD', label: 'Unread' },
          { value: 'LOW_STOCK', label: 'Low Stock' },
          { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
          { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
          { value: 'EXPIRED', label: 'Expired' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {option.label}
          </button>
        ))}
        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 ml-auto"
        >
          {sortOrder === 'newest' ? '⬇️ Newest' : '⬆️ Oldest'}
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading alerts...</p>
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">No Alerts</h3>
            <p className="text-gray-600 mt-2">Everything looks good! No alerts to display.</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`card border-l-4 ${getAlertColor(alert.alertType)} ${!alert.isRead ? 'shadow-md' : 'opacity-75'
                }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.alertType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.productCode}
                      </p>
                      <p className="text-gray-800 mt-2">{alert.message}</p>
                      {alert.description && (
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Mark as read"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.alertType === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                        alert.alertType === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                          alert.alertType === 'EXPIRING_SOON' ? 'bg-orange-100 text-orange-800' :
                            alert.alertType === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                      }`}>
                      {alert.alertType.replace(/_/g, ' ')}
                    </span>
                    {alert.currentQuantity !== null && (
                      <span>Current: {alert.currentQuantity} units</span>
                    )}
                    {alert.thresholdQuantity !== null && alert.thresholdQuantity > 0 && (
                      <span>Threshold: {alert.thresholdQuantity} units</span>
                    )}
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>

                  {alert.isResolved && (
                    <div className="mt-2 text-sm text-green-600">
                      Resolved by {alert.resolvedByName} on{' '}
                      {new Date(alert.resolvedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertList;
