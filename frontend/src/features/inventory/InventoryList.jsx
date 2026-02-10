import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { fetchInventory, fetchLowStock } from './inventorySlice';

const InventoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventory, lowStock, loading } = useSelector((state) => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchLowStock());
  }, [dispatch]);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'LOW') return matchesSearch && item.isLowStock;
    if (filterStatus === 'OUT') return matchesSearch && item.isOutOfStock;
    if (filterStatus === 'OK') return matchesSearch && !item.isLowStock && !item.isOutOfStock;
    return matchesSearch;
  });

  const getStockStatus = (item) => {
    if (item.isOutOfStock) {
      return { text: 'Out of Stock', class: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon };
    } else if (item.isLowStock) {
      return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon };
    } else {
      return { text: 'In Stock', class: 'bg-green-100 text-green-800', icon: null };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#8B4513]">Inventory</h1>
        <button
          onClick={() => navigate('/inventory/update')}
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Update Stock</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="ALL">All Status</option>
          <option value="OK">In Stock</option>
          <option value="LOW">Low Stock</option>
          <option value="OUT">Out of Stock</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">In Stock</p>
              <p className="text-2xl font-bold text-green-800">
                {inventory.filter(i => !i.isLowStock && !i.isOutOfStock).length}
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <ArrowPathIcon className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="card bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-800">
                {lowStock.length}
              </p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-800">
                {inventory.filter(i => i.isOutOfStock).length}
              </p>
            </div>
            <div className="bg-red-200 p-3 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.productCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.currentQuantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.availableQuantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${stockStatus.class}`}>
                          {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate('/inventory/update', { state: { productId: item.productId } })}
                          className="text-[#8B4513] hover:text-[#DAA520] mr-2"
                          title="Update Stock"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
