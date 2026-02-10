import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  fetchStockReport,
  fetchSalesReport,
  fetchUsageReport,
  downloadReportCSV,
  clearReports,
} from './reportSlice';

const Reports = () => {
  const dispatch = useDispatch();
  const { stockReport, salesReport, usageReport, loading } = useSelector((state) => state.reports);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeTab, setActiveTab] = useState('stock');

  const handleGenerateReport = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59);

    switch (activeTab) {
      case 'stock':
        dispatch(fetchStockReport({ startDate: start.toISOString(), endDate: end.toISOString() }));
        break;
      case 'sales':
        dispatch(fetchSalesReport({ startDate: start.toISOString(), endDate: end.toISOString() }));
        break;
      case 'usage':
        dispatch(fetchUsageReport({ startDate: start.toISOString(), endDate: end.toISOString() }));
        break;
      default:
        break;
    }
  };

  const handleDownloadCSV = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59);

    dispatch(downloadReportCSV({
      type: activeTab,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#8B4513]">Reports</h1>
      </div>

      {/* Report Type Tabs */}
      <div className="card">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'stock', label: 'Stock Report', icon: ChartBarIcon },
            { id: 'sales', label: 'Sales Report', icon: ChartBarIcon },
            { id: 'usage', label: 'Usage Report', icon: ArrowPathIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  dispatch(clearReports());
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#8B4513] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <ChartBarIcon className="h-5 w-5" />
                <span>Generate</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={loading || (!stockReport && !salesReport && !usageReport)}
            className="btn-secondary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      {activeTab === 'stock' && stockReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600">Total Products</p>
              <p className="text-3xl font-bold text-blue-800">{stockReport.totalProducts}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm text-green-600">Finished Goods</p>
              <p className="text-3xl font-bold text-green-800">{stockReport.finishedGoods}</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-sm text-purple-600">Raw Materials</p>
              <p className="text-3xl font-bold text-purple-800">{stockReport.rawMaterials}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-sm text-yellow-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-800">{stockReport.lowStockCount}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Stock Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stockReport.inventoryDetails?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm">{item.productName}</td>
                      <td className="px-4 py-2 text-sm">{item.categoryName}</td>
                      <td className="px-4 py-2 text-sm">{item.productType}</td>
                      <td className="px-4 py-2 text-sm">{item.currentQuantity}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isOutOfStock ? 'bg-red-100 text-red-800' :
                          item.isLowStock ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.isOutOfStock ? 'Out of Stock' : item.isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && salesReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600">Total Stock In</p>
              <p className="text-3xl font-bold text-blue-800">{salesReport.totalStockIn}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm text-green-600">Total Stock Out</p>
              <p className="text-3xl font-bold text-green-800">{salesReport.totalStockOut}</p>
            </div>
            <div className="card bg-purple-50">
              <p className="text-sm text-purple-600">Total Sales Amount</p>
              <p className="text-3xl font-bold text-purple-800">${salesReport.totalSalesAmount}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-sm text-yellow-600">Transactions</p>
              <p className="text-3xl font-bold text-yellow-800">{salesReport.totalTransactions}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sales Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesReport.salesDetails?.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-2 text-sm">{new Date(sale.transactionDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{sale.productName}</td>
                      <td className="px-4 py-2 text-sm">{Math.abs(sale.quantity)}</td>
                      <td className="px-4 py-2 text-sm">${sale.unitPrice || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">${sale.totalAmount || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm">{sale.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage' && usageReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600">Total Transactions</p>
              <p className="text-3xl font-bold text-blue-800">{usageReport.totalTransactions}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm text-green-600">Stock In</p>
              <p className="text-3xl font-bold text-green-800">{usageReport.stockInCount}</p>
            </div>
            <div className="card bg-red-50">
              <p className="text-sm text-red-600">Stock Out</p>
              <p className="text-3xl font-bold text-red-800">{usageReport.stockOutCount}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-sm text-yellow-600">Adjustments</p>
              <p className="text-3xl font-bold text-yellow-800">{usageReport.adjustmentCount}</p>
            </div>
            <div className="card bg-orange-50">
              <p className="text-sm text-orange-600">Wastage</p>
              <p className="text-3xl font-bold text-orange-800">{usageReport.wastageCount}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usageReport.transactionDetails?.map((trans) => (
                    <tr key={trans.id}>
                      <td className="px-4 py-2 text-sm">{new Date(trans.transactionDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{trans.productName}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trans.transactionType === 'STOCK_IN' ? 'bg-green-100 text-green-800' :
                          trans.transactionType === 'STOCK_OUT' ? 'bg-red-100 text-red-800' :
                          trans.transactionType === 'ADJUSTMENT' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trans.transactionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{trans.quantity}</td>
                      <td className="px-4 py-2 text-sm">{trans.previousQuantity}</td>
                      <td className="px-4 py-2 text-sm">{trans.newQuantity}</td>
                      <td className="px-4 py-2 text-sm">{trans.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
