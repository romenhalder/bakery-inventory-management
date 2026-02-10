import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { fetchProducts } from '../features/products/productSlice';
import { fetchInventory, fetchLowStock } from '../features/inventory/inventorySlice';
import { fetchUnreadAlerts } from '../features/alerts/alertSlice';

const EmployeeDashboard = () => {
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
      title: 'Products',
      value: products.length,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Inventory',
      value: inventory.length,
      icon: ArchiveBoxIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Low Stock',
      value: lowStock.length,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'Alerts',
      value: unreadAlerts.length,
      icon: ClipboardDocumentListIcon,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#8B4513]">Employee Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
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

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-[#8B4513] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/inventory/update')}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-green-600" />
            <span className="font-medium text-green-700">Stock In</span>
          </button>
          <button
            onClick={() => navigate('/inventory/update')}
            className="flex items-center justify-center space-x-2 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <MinusIcon className="h-6 w-6 text-red-600" />
            <span className="font-medium text-red-700">Stock Out (Sale)</span>
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            <span className="font-medium text-blue-700">View Products</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-[#8B4513]">Low Stock Items</h2>
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
                {lowStock.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.currentQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{item.minStockLevel}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lowStock.length > 5 && (
            <button
              onClick={() => navigate('/inventory')}
              className="mt-4 text-sm text-[#8B4513] hover:text-[#DAA520]"
            >
              View all {lowStock.length} low stock items →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
