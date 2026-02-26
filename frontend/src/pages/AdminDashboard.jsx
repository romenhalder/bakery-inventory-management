import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  KeyIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { fetchProducts } from '../features/products/productSlice';
import { fetchInventory, fetchLowStock } from '../features/inventory/inventorySlice';
import { fetchUnreadAlerts } from '../features/alerts/alertSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  const { products } = useSelector((state) => state.products);
  const { inventory, lowStock } = useSelector((state) => state.inventory);
  const { unreadAlerts } = useSelector((state) => state.alerts);
  const [passwordResetCount, setPasswordResetCount] = useState(0);
  const [todaySales, setTodaySales] = useState({ totalSales: 0, transactionCount: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [expandedSale, setExpandedSale] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchInventory());
    dispatch(fetchLowStock());
    dispatch(fetchUnreadAlerts());
    if (isAdmin) fetchPasswordResetCount();
    fetchTodaySales();
    fetchRecentSales();
  }, [dispatch]);

  const fetchPasswordResetCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/password-reset/requests/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordResetCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch password reset count', err);
    }
  };

  const fetchTodaySales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales/summary/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodaySales(response.data);
    } catch (err) {
      console.error('Failed to fetch today sales', err);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales/recent?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentSales(response.data);
    } catch (err) {
      console.error('Failed to fetch recent sales', err);
    }
  };

  const stats = [
    {
      title: "Today's Sales",
      value: `₹${todaySales.totalSales || 0}`,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500',
      link: '/sell',
    },
    {
      title: 'Transactions Today',
      value: todaySales.transactionCount || 0,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      link: '/transactions',
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: ShoppingBagIcon,
      color: 'bg-indigo-500',
      link: '/products',
    },
    {
      title: 'Low Stock Items',
      value: lowStock.length,
      icon: ExclamationTriangleIcon,
      color: lowStock.length > 0 ? 'bg-red-500' : 'bg-green-500',
      link: '/alerts',
    },
    ...(isAdmin ? [{
      title: 'Password Requests',
      value: passwordResetCount,
      icon: KeyIcon,
      color: passwordResetCount > 0 ? 'bg-orange-500' : 'bg-gray-400',
      link: '/password-reset-requests',
    }] : []),
  ];

  const getStockStatus = () => {
    const outOfStock = products.filter(p => p.currentStock === 0 || p.isOutOfStock).length;
    const lowStockItems = products.filter(p => p.currentStock > 0 && (p.isLowStock || p.currentStock <= p.minStockLevel)).length;
    const inStock = products.length - outOfStock - lowStockItems;
    return { outOfStock, lowStockItems, inStock };
  };

  const stockStatus = getStockStatus();

  const getItemStockBadge = (item) => {
    if (item.currentQuantity === 0 || item.currentQuantity <= 0) {
      return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    }
    return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">
            {isAdmin ? 'Admin' : 'Manager'} Dashboard
          </h1>
          <p className="text-gray-500">Welcome back, {user?.fullName}!</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/sell')}
            className="btn-primary bg-green-600 hover:bg-green-700"
          >
            🧁 New Sale
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales - Expanded with full details */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#8B4513]">Recent Sales</h2>
            <button onClick={() => navigate('/transactions')} className="text-sm text-blue-600 hover:underline">
              View All →
            </button>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales today</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Order</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Items</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sold By</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Payment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentSales.map((sale) => (
                    <>
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm font-medium">{sale.orderNumber}</td>
                        <td className="px-3 py-2 text-sm">
                          <div>{sale.customerName || '-'}</div>
                          {sale.customerMobile && (
                            <div className="text-xs text-gray-400">{sale.customerMobile}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm">{sale.items?.length || 0} items</td>
                        <td className="px-3 py-2 text-sm font-semibold text-green-600">₹{sale.totalAmount}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{sale.soldByName || '-'}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                            {sale.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                            className="text-gray-400 hover:text-[#8B4513]"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                      {expandedSale === sale.id && sale.items && (
                        <tr key={`${sale.id}-details`}>
                          <td colSpan="8" className="px-3 py-2 bg-[#FDF5E6]">
                            <div className="text-xs font-medium text-gray-600 mb-1">Item Details:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {sale.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs bg-white px-2 py-1 rounded">
                                  <span>{item.productName}</span>
                                  <span className="text-gray-600">
                                    {item.quantity} × ₹{item.unitPrice} = <span className="font-semibold">₹{item.totalPrice}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/products/add')}
                className="p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <ShoppingBagIcon className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <span className="text-xs font-medium text-blue-700">Add Product</span>
              </button>
              <button
                onClick={() => navigate('/inventory/update')}
                className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
              >
                <ArchiveBoxIcon className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <span className="text-xs font-medium text-green-700">Update Stock</span>
              </button>
              <button
                onClick={() => navigate('/alerts')}
                className="p-3 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors relative"
              >
                <ExclamationTriangleIcon className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
                <span className="text-xs font-medium text-yellow-700">Alerts</span>
                {lowStock.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {lowStock.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/sell')}
                className="p-3 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
              >
                <CurrencyRupeeIcon className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-700">POS Sale</span>
              </button>
            </div>
          </div>

          {/* Stock Overview */}
          <div className="card">
            <h2 className="text-xl font-bold text-[#8B4513] mb-4">Stock Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">In Stock</span>
                </div>
                <span className="font-semibold">{stockStatus.inStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Low Stock</span>
                </div>
                <span className="font-semibold text-yellow-600">{stockStatus.lowStockItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Out of Stock</span>
                </div>
                <span className="font-semibold text-red-600">{stockStatus.outOfStock}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="w-full mt-4 text-sm text-blue-600 hover:underline"
            >
              View All Products →
            </button>
          </div>

          {/* Password Reset Alert - Admin Only */}
          {isAdmin && passwordResetCount > 0 && (
            <div className="card border-l-4 border-orange-500">
              <div className="flex items-center space-x-3 mb-2">
                <KeyIcon className="h-6 w-6 text-orange-500" />
                <h2 className="text-lg font-bold text-[#8B4513]">Pending Resets</h2>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                There {passwordResetCount === 1 ? 'is 1 pending' : `are ${passwordResetCount} pending`} password reset request(s).
              </p>
              <Link to="/password-reset-requests" className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center">
                Review Requests <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div className="card border-l-4 border-yellow-500 mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-[#8B4513]">Stock Alerts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStock.slice(0, 5).map((item) => {
                  const badge = getItemStockBadge(item);
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.currentQuantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.minStockLevel}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {lowStock.length > 5 && (
            <button
              onClick={() => navigate('/inventory')}
              className="mt-4 text-sm text-[#8B4513] hover:text-[#DAA520]"
            >
              View all {lowStock.length} stock alert items →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
