import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { fetchProducts } from '../features/products/productSlice';
import { fetchInventory, fetchLowStock } from '../features/inventory/inventorySlice';
import { fetchUnreadAlerts } from '../features/alerts/alertSlice';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const { inventory, lowStock } = useSelector((state) => state.inventory);
  const { unreadAlerts } = useSelector((state) => state.alerts);
  const [mySales, setMySales] = useState([]);
  const [mySalesSummary, setMySalesSummary] = useState({ totalSales: 0, count: 0 });

  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchInventory());
    dispatch(fetchLowStock());
    dispatch(fetchUnreadAlerts());
    fetchMySales();
  }, [dispatch]);

  const fetchMySales = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/recent?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMySales(data);
        // Calculate today's personal sales
        const today = new Date().toDateString();
        const todaySales = data.filter(s => new Date(s.createdAt).toDateString() === today);
        const total = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        setMySalesSummary({ totalSales: total, count: todaySales.length });
      }
    } catch (err) {
      console.error('Failed to fetch my sales', err);
    }
  };

  const getStockStatus = () => {
    const outOfStock = products.filter(p => p.currentStock === 0 || p.isOutOfStock).length;
    const lowStockItems = products.filter(p => p.currentStock > 0 && (p.isLowStock || p.currentStock <= p.minStockLevel)).length;
    const inStock = products.length - outOfStock - lowStockItems;
    return { outOfStock, lowStockItems, inStock };
  };

  const stockStatus = getStockStatus();
  const totalProducts = products.length || 1;
  const inStockPercent = Math.round((stockStatus.inStock / totalProducts) * 100);
  const lowStockPercent = Math.round((stockStatus.lowStockItems / totalProducts) * 100);
  const outOfStockPercent = Math.round((stockStatus.outOfStock / totalProducts) * 100);

  const getItemStockBadge = (item) => {
    if (item.currentQuantity === 0 || item.currentQuantity <= 0) {
      return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
    }
    return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋</p>
            <h1 className="text-2xl font-bold mt-1">{user?.fullName}</h1>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-bold bg-white/20 rounded-full">
              {user?.role === 'EMPLOYEE' ? '🏷️ Employee' : '🏷️ ' + user?.role}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">My Sales Today</p>
            <p className="text-3xl font-bold">₹{mySalesSummary.totalSales}</p>
            <p className="text-xs opacity-70">{mySalesSummary.count} transactions</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
            </div>
            <div className="bg-blue-500 p-2.5 rounded-lg">
              <ShoppingBagIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/inventory')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inventory.length}</p>
            </div>
            <div className="bg-green-500 p-2.5 rounded-lg">
              <ArchiveBoxIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/alerts')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{unreadAlerts.length}</p>
            </div>
            <div className={`${unreadAlerts.length > 0 ? 'bg-red-500' : 'bg-gray-400'} p-2.5 rounded-lg`}>
              <ExclamationTriangleIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/sell')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Sale</p>
              <p className="text-2xl font-bold text-green-600 mt-1">POS</p>
            </div>
            <div className="bg-purple-500 p-2.5 rounded-lg">
              <CurrencyRupeeIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-bold text-[#8B4513] mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/sell')}
              className="flex items-center w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600 mr-3" />
              <div className="text-left">
                <span className="font-medium text-green-700 text-sm">New Sale</span>
                <p className="text-xs text-green-500">Open POS billing</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/inventory/update', { state: { defaultType: 'STOCK_IN' } })}
              className="flex items-center w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div className="text-left">
                <span className="font-medium text-blue-700 text-sm">Stock In</span>
                <p className="text-xs text-blue-500">Add received items</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/inventory/update', { state: { defaultType: 'STOCK_OUT' } })}
              className="flex items-center w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <MinusIcon className="h-6 w-6 text-red-600 mr-3" />
              <div className="text-left">
                <span className="font-medium text-red-700 text-sm">Stock Out</span>
                <p className="text-xs text-red-500">Record usage or wastage</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center w-full p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <ShoppingBagIcon className="h-6 w-6 text-purple-600 mr-3" />
              <div className="text-left">
                <span className="font-medium text-purple-700 text-sm">View Products</span>
                <p className="text-xs text-purple-500">Browse all items</p>
              </div>
            </button>
          </div>
        </div>

        {/* My Recent Sales */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#8B4513]">📋 My Recent Sales</h2>
          </div>
          {mySales.length === 0 ? (
            <div className="text-center py-6">
              <CurrencyRupeeIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No sales yet. Start selling!</p>
              <button
                onClick={() => navigate('/sell')}
                className="mt-3 px-4 py-2 bg-[#8B4513] text-white text-sm rounded-lg hover:bg-[#A0522D]"
              >
                Open POS
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {mySales.slice(0, 8).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sale.customerName || sale.customerMobile || 'Walk-in'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.items?.length || 0} items • {new Date(sale.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">₹{sale.totalAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Overview & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Overview */}
        <div className="card">
          <h2 className="text-lg font-bold text-[#8B4513] mb-4">📊 Stock Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">In Stock</span>
                <span className="font-medium text-green-600">{stockStatus.inStock} ({inStockPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${inStockPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Low Stock</span>
                <span className="font-medium text-yellow-600">{stockStatus.lowStockItems} ({lowStockPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${lowStockPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Out of Stock</span>
                <span className="font-medium text-red-600">{stockStatus.outOfStock} ({outOfStockPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${outOfStockPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks - items to restock */}
        <div className="card">
          <h2 className="text-lg font-bold text-[#8B4513] mb-4">📌 Pending Tasks</h2>
          {lowStock.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">All good! No urgent tasks.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {lowStock.slice(0, 6).map((item) => {
                const badge = getItemStockBadge(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Current: {item.currentQuantity} | Min: {item.minStockLevel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.class}`}>
                        {badge.text}
                      </span>
                      <button
                        onClick={() => navigate('/inventory/update', { state: { productId: item.productId, defaultType: 'STOCK_IN' } })}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
