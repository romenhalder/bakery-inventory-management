import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { fetchProducts } from '../features/products/productSlice';
import { fetchInventory, fetchLowStock } from '../features/inventory/inventorySlice';
import { fetchUnreadAlerts } from '../features/alerts/alertSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { products } = useSelector((state) => state.products);
  const { inventory, lowStock } = useSelector((state) => state.inventory);
  const { unreadAlerts } = useSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchInventory());
    dispatch(fetchLowStock());
    dispatch(fetchUnreadAlerts());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      link: '/products',
    },
    {
      title: 'Inventory Items',
      value: inventory.length,
      icon: ArchiveBoxIcon,
      color: 'bg-green-500',
      link: '/inventory',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStock.length,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      link: '/alerts',
    },
    {
      title: 'Unread Alerts',
      value: unreadAlerts.length,
      icon: CubeIcon,
      color: 'bg-red-500',
      link: '/alerts',
    },
  ];

  const recentActivities = [
    { text: 'New product added: Chocolate Cake', time: '2 hours ago', type: 'add' },
    { text: 'Stock updated: Flour (+50 kg)', time: '3 hours ago', type: 'update' },
    { text: 'Low stock alert: Sugar', time: '5 hours ago', type: 'alert' },
    { text: 'Product sold: Croissant x 10', time: '1 day ago', type: 'sale' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#8B4513]">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/products/add')}
          className="btn-primary"
        >
          + Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={() => navigate(stat.link)}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                <div className={`p-2 rounded-full ${
                  activity.type === 'add' ? 'bg-green-100 text-green-600' :
                  activity.type === 'update' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {activity.type === 'add' && <ArrowTrendingUpIcon className="h-4 w-4" />}
                  {activity.type === 'update' && <CubeIcon className="h-4 w-4" />}
                  {activity.type === 'alert' && <ExclamationTriangleIcon className="h-4 w-4" />}
                  {activity.type === 'sale' && <ArrowTrendingDownIcon className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-[#8B4513] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/products/add')}
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <ShoppingBagIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">Add Product</span>
            </button>
            <button
              onClick={() => navigate('/inventory/update')}
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <ArchiveBoxIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Update Stock</span>
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors"
            >
              <ExclamationTriangleIcon className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-700">View Alerts</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
