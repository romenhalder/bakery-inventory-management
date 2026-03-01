import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  ArrowPathIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  fetchAnalytics,
  fetchStockReport,
  fetchSalesReport,
  fetchUsageReport,
  downloadReportCSV,
  clearReports,
} from './reportSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Color palette
const COLORS = ['#8B4513', '#DAA520', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#FFDEAD', '#FFE4B5'];

const Reports = () => {
  const dispatch = useDispatch();
  const { analytics, stockReport, salesReport, usageReport, loading } = useSelector((state) => state.reports);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) {
      dispatch(fetchAnalytics());
    }
  }, [activeTab, analytics, dispatch]);

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
    dispatch(downloadReportCSV({ type: activeTab, startDate: start.toISOString(), endDate: end.toISOString() }));
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // =========================
  // PDF Generation Functions
  // =========================

  const addPdfHeader = (doc, title, dateInfo) => {
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Bakery Inventory Management', 14, 18);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 32);
    if (dateInfo) {
      doc.setFontSize(9);
      doc.text(dateInfo, doc.internal.pageSize.width - 14, 32, { align: 'right' });
    }
    doc.setTextColor(0, 0, 0);
    return 48;
  };

  const addPdfFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  };

  const downloadAnalyticsPdf = () => {
    if (!analytics) return;
    const doc = new jsPDF();
    let y = addPdfHeader(doc, 'Business Analytics Report', `Generated: ${new Date().toLocaleDateString()}`);

    // Sales KPIs
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Sales Overview', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Period', 'Revenue', 'Orders']],
      body: [
        ['Today', formatCurrency(analytics.todaySales), String(analytics.todayOrderCount)],
        ['This Week', formatCurrency(analytics.weekSales), String(analytics.weekOrderCount)],
        ['This Month', formatCurrency(analytics.monthSales), String(analytics.monthOrderCount)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // Stock Health
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Stock Health', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count']],
      body: [
        ['In Stock', String(analytics.inStockCount)],
        ['Low Stock', String(analytics.lowStockCount)],
        ['Out of Stock', String(analytics.outOfStockCount)],
        ['Total Products', String(analytics.totalProducts)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // Top Products
    if (analytics.topProducts?.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Top Selling Products (Last 30 Days)', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Product', 'Qty Sold', 'Revenue']],
        body: analytics.topProducts.map((p, i) => [
          String(i + 1), p.name, String(p.quantity), formatCurrency(p.revenue),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 69, 19], textColor: 255 },
        styles: { fontSize: 10 },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // Category Breakdown
    if (analytics.categoryBreakdown?.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Category Breakdown (Last 30 Days)', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Category', 'Qty Sold', 'Revenue']],
        body: analytics.categoryBreakdown.map((c) => [
          c.category, String(c.quantity), formatCurrency(c.revenue),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 69, 19], textColor: 255 },
        styles: { fontSize: 10 },
      });
    }

    addPdfFooter(doc);
    doc.save('analytics-report.pdf');
  };

  const downloadStockPdf = () => {
    if (!stockReport) return;
    const doc = new jsPDF('l'); // landscape
    let y = addPdfHeader(doc, 'Stock Report', `${stockReport.startDate} to ${stockReport.endDate}`);

    // Summary
    autoTable(doc, {
      startY: y,
      head: [['Total Products', 'Finished Goods', 'Raw Materials', 'Low Stock', 'Out of Stock', 'Total Stock Qty']],
      body: [[
        String(stockReport.totalProducts), String(stockReport.finishedGoods),
        String(stockReport.rawMaterials), String(stockReport.lowStockCount),
        String(stockReport.outOfStockCount), String(stockReport.totalStockQuantity),
      ]],
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 10;

    // Details
    if (stockReport.inventoryDetails?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Product', 'Category', 'Type', 'Stock', 'Status']],
        body: stockReport.inventoryDetails.map((item) => [
          item.productName, item.categoryName, item.productType,
          String(item.currentQuantity),
          item.isOutOfStock ? 'Out of Stock' : item.isLowStock ? 'Low Stock' : 'In Stock',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [253, 245, 230] },
      });
    }

    addPdfFooter(doc);
    doc.save(`stock-report-${stockReport.startDate}-to-${stockReport.endDate}.pdf`);
  };

  const downloadSalesPdf = () => {
    if (!salesReport) return;
    const doc = new jsPDF('l');
    let y = addPdfHeader(doc, 'Sales Report', `${salesReport.startDate} to ${salesReport.endDate}`);

    autoTable(doc, {
      startY: y,
      head: [['Total Stock In', 'Total Stock Out', 'Total Sales Amount', 'Total Transactions']],
      body: [[
        String(salesReport.totalStockIn), String(salesReport.totalStockOut),
        formatCurrency(salesReport.totalSalesAmount), String(salesReport.totalTransactions),
      ]],
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 10;

    if (salesReport.salesDetails?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Date', 'Product', 'Qty', 'Unit Price', 'Total', 'User']],
        body: salesReport.salesDetails.map((s) => [
          new Date(s.transactionDate).toLocaleDateString(), s.productName,
          String(Math.abs(s.quantity)), s.unitPrice ? formatCurrency(s.unitPrice) : 'N/A',
          s.totalAmount ? formatCurrency(s.totalAmount) : 'N/A', s.userName,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19], textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [253, 245, 230] },
      });
    }

    addPdfFooter(doc);
    doc.save(`sales-report-${salesReport.startDate}-to-${salesReport.endDate}.pdf`);
  };

  const downloadUsagePdf = () => {
    if (!usageReport) return;
    const doc = new jsPDF('l');
    let y = addPdfHeader(doc, 'Usage Report', `${usageReport.startDate} to ${usageReport.endDate}`);

    autoTable(doc, {
      startY: y,
      head: [['Total', 'Stock In', 'Stock Out', 'Adjustments', 'Wastage', 'Returns']],
      body: [[
        String(usageReport.totalTransactions), String(usageReport.stockInCount),
        String(usageReport.stockOutCount), String(usageReport.adjustmentCount),
        String(usageReport.wastageCount), String(usageReport.returnCount),
      ]],
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255 },
    });
    y = doc.lastAutoTable.finalY + 10;

    if (usageReport.transactionDetails?.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Date', 'Product', 'Type', 'Qty', 'Previous', 'New', 'User']],
        body: usageReport.transactionDetails.map((t) => [
          new Date(t.transactionDate).toLocaleDateString(), t.productName,
          t.transactionType.replace(/_/g, ' '), String(t.quantity),
          String(t.previousQuantity), String(t.newQuantity), t.userName,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19], textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [253, 245, 230] },
      });
    }

    addPdfFooter(doc);
    doc.save(`usage-report-${usageReport.startDate}-to-${usageReport.endDate}.pdf`);
  };

  const handleDownloadPDF = () => {
    switch (activeTab) {
      case 'analytics': downloadAnalyticsPdf(); break;
      case 'stock': downloadStockPdf(); break;
      case 'sales': downloadSalesPdf(); break;
      case 'usage': downloadUsagePdf(); break;
      default: break;
    }
  };

  // =========================
  // Render Helpers
  // =========================

  const maxQty = analytics?.topProducts?.length > 0
    ? Math.max(...analytics.topProducts.map((p) => Number(p.quantity)))
    : 1;

  const totalCategoryRevenue = analytics?.categoryBreakdown?.reduce((sum, c) => sum + Number(c.revenue), 0) || 1;

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
    { id: 'stock', label: 'Stock Report', icon: CubeIcon },
    { id: 'sales', label: 'Sales Report', icon: CurrencyRupeeIcon },
    { id: 'usage', label: 'Usage Report', icon: ArrowPathIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business insights and downloadable reports</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={loading || (activeTab === 'analytics' && !analytics) ||
            (activeTab === 'stock' && !stockReport) ||
            (activeTab === 'sales' && !salesReport) ||
            (activeTab === 'usage' && !usageReport)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'analytics') dispatch(clearReports());
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white shadow-md'
                    : 'text-gray-500 hover:text-[#8B4513] hover:bg-[#FDF5E6]'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range (only for non-analytics tabs) */}
      {activeTab !== 'analytics' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />Start Date
                </label>
                <input type="date" value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />End Date
                </label>
                <input type="date" value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent" />
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleGenerateReport} disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B3410] transition-colors">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <><ChartBarIcon className="h-5 w-5" /><span>Generate</span></>
                )}
              </button>
              <button onClick={handleDownloadCSV}
                disabled={loading || (!stockReport && !salesReport && !usageReport)}
                className="flex items-center space-x-2 px-4 py-2.5 border-2 border-[#8B4513] text-[#8B4513] rounded-lg hover:bg-[#FDF5E6] transition-colors disabled:opacity-50">
                <DocumentArrowDownIcon className="h-5 w-5" /><span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== */}
      {/* ANALYTICS TAB       */}
      {/* =================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loading && !analytics && (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B4513] border-t-transparent"></div>
            </div>
          )}

          {analytics && (
            <>
              {/* Sales KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: "Today's Sales", value: formatCurrency(analytics.todaySales), sub: `${analytics.todayOrderCount} orders`, color: 'from-emerald-500 to-emerald-600', icon: CurrencyRupeeIcon },
                  { label: "This Week", value: formatCurrency(analytics.weekSales), sub: `${analytics.weekOrderCount} orders`, color: 'from-blue-500 to-blue-600', icon: ShoppingBagIcon },
                  { label: "This Month", value: formatCurrency(analytics.monthSales), sub: `${analytics.monthOrderCount} orders`, color: 'from-purple-500 to-purple-600', icon: ChartBarIcon },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-xl p-5 text-white shadow-lg`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/80">{kpi.label}</p>
                          <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                          <p className="text-xs text-white/70 mt-1">{kpi.sub}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                          <Icon className="h-7 w-7" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stock Health + Wastage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Stock Health Donut */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Stock Health</h3>
                  <div className="flex items-center gap-8">
                    {/* CSS Donut */}
                    <div className="relative w-36 h-36 flex-shrink-0">
                      {(() => {
                        const total = Number(analytics.totalProducts) || 1;
                        const inPct = (Number(analytics.inStockCount) / total) * 100;
                        const lowPct = (Number(analytics.lowStockCount) / total) * 100;
                        const outPct = (Number(analytics.outOfStockCount) / total) * 100;
                        return (
                          <div className="w-36 h-36 rounded-full" style={{
                            background: `conic-gradient(
                              #22c55e 0% ${inPct}%,
                              #f59e0b ${inPct}% ${inPct + lowPct}%,
                              #ef4444 ${inPct + lowPct}% ${inPct + lowPct + outPct}%,
                              #e5e7eb ${inPct + lowPct + outPct}% 100%
                            )`
                          }}>
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-xl font-bold text-gray-800">{analytics.totalProducts}</p>
                                <p className="text-[10px] text-gray-500">Products</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="space-y-3 flex-1">
                      {[
                        { label: 'In Stock', count: analytics.inStockCount, color: 'bg-green-500' },
                        { label: 'Low Stock', count: analytics.lowStockCount, color: 'bg-amber-500' },
                        { label: 'Out of Stock', count: analytics.outOfStockCount, color: 'bg-red-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-gray-600">{item.label}</span>
                          </div>
                          <span className="font-semibold text-gray-800">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inventory & Wastage Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Movement</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Stock In (30d)', value: analytics.monthStockIn, icon: '📦', bg: 'bg-green-50', text: 'text-green-700' },
                      { label: 'Stock Out (30d)', value: analytics.monthStockOut, icon: '📤', bg: 'bg-blue-50', text: 'text-blue-700' },
                      { label: 'Wastage (30d)', value: analytics.monthWastage, icon: '🗑️', bg: 'bg-red-50', text: 'text-red-700' },
                      { label: 'Wastage (7d)', value: analytics.weekWastage, icon: '⚠️', bg: 'bg-amber-50', text: 'text-amber-700' },
                    ].map((item) => (
                      <div key={item.label} className={`${item.bg} rounded-lg p-4`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-xs font-medium text-gray-500">{item.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${item.text}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Selling Products */}
              {analytics.topProducts?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-5">Top Selling Products <span className="text-sm font-normal text-gray-400">(Last 30 Days)</span></h3>
                  <div className="space-y-3">
                    {analytics.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <span className="text-xs text-gray-500">{product.quantity} sold</span>
                              <span className="text-sm font-semibold text-[#8B4513]">{formatCurrency(product.revenue)}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(Number(product.quantity) / maxQty) * 100}%`,
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {analytics.categoryBreakdown?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-5">Sales by Category <span className="text-sm font-normal text-gray-400">(Last 30 Days)</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.categoryBreakdown.map((cat, idx) => {
                      const pct = ((Number(cat.revenue) / totalCategoryRevenue) * 100).toFixed(1);
                      return (
                        <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-800">{cat.category}</span>
                            <span className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}>
                              {pct}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">{cat.quantity} items</span>
                            <span className="font-semibold text-[#8B4513]">{formatCurrency(cat.revenue)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Refresh */}
              <div className="flex justify-center">
                <button onClick={() => dispatch(fetchAnalytics())}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-[#8B4513] transition-colors">
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Refresh Analytics</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =================== */}
      {/* STOCK REPORT TAB    */}
      {/* =================== */}
      {activeTab === 'stock' && stockReport && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: stockReport.totalProducts, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Finished Goods', value: stockReport.finishedGoods, bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Raw Materials', value: stockReport.rawMaterials, bg: 'bg-purple-50', text: 'text-purple-700' },
              { label: 'Low Stock', value: stockReport.lowStockCount, bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Category', 'Type', 'Stock', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockReport.inventoryDetails?.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FDF5E6]/50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.categoryName}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.productType}</td>
                      <td className="px-5 py-3 text-sm font-semibold">{item.currentQuantity}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.isOutOfStock ? 'bg-red-100 text-red-700' :
                            item.isLowStock ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
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

      {/* =================== */}
      {/* SALES REPORT TAB    */}
      {/* =================== */}
      {activeTab === 'sales' && salesReport && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Stock In', value: salesReport.totalStockIn, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Stock Out', value: salesReport.totalStockOut, bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Sales Amount', value: formatCurrency(salesReport.totalSalesAmount), bg: 'bg-purple-50', text: 'text-purple-700' },
              { label: 'Transactions', value: salesReport.totalTransactions, bg: 'bg-amber-50', text: 'text-amber-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.text} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Sales Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Product', 'Qty', 'Unit Price', 'Total', 'User'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesReport.salesDetails?.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FDF5E6]/50">
                      <td className="px-5 py-3 text-sm text-gray-600">{new Date(sale.transactionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{sale.productName}</td>
                      <td className="px-5 py-3 text-sm">{Math.abs(sale.quantity)}</td>
                      <td className="px-5 py-3 text-sm">{sale.unitPrice ? formatCurrency(sale.unitPrice) : 'N/A'}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[#8B4513]">{sale.totalAmount ? formatCurrency(sale.totalAmount) : 'N/A'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{sale.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================== */}
      {/* USAGE REPORT TAB    */}
      {/* =================== */}
      {activeTab === 'usage' && usageReport && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: usageReport.totalTransactions, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Stock In', value: usageReport.stockInCount, bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Stock Out', value: usageReport.stockOutCount, bg: 'bg-red-50', text: 'text-red-700' },
              { label: 'Adjustments', value: usageReport.adjustmentCount, bg: 'bg-amber-50', text: 'text-amber-700' },
              { label: 'Wastage', value: usageReport.wastageCount, bg: 'bg-orange-50', text: 'text-orange-700' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.text} mt-1`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Product', 'Type', 'Qty', 'Previous', 'New', 'User'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usageReport.transactionDetails?.map((trans) => (
                    <tr key={trans.id} className="hover:bg-[#FDF5E6]/50">
                      <td className="px-5 py-3 text-sm text-gray-600">{new Date(trans.transactionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{trans.productName}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${trans.transactionType === 'STOCK_IN' ? 'bg-green-100 text-green-700' :
                            trans.transactionType === 'STOCK_OUT' ? 'bg-red-100 text-red-700' :
                              trans.transactionType === 'ADJUSTMENT' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                          }`}>
                          {trans.transactionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">{trans.quantity}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{trans.previousQuantity}</td>
                      <td className="px-5 py-3 text-sm font-medium">{trans.newQuantity}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{trans.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for report tabs */}
      {activeTab !== 'analytics' && !stockReport && !salesReport && !usageReport && !loading && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">Select a date range and generate</h3>
          <p className="text-sm text-gray-400 mt-1">Choose your date range above and click Generate</p>
        </div>
      )}

      {/* Loading for report tabs */}
      {activeTab !== 'analytics' && loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B4513] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default Reports;
