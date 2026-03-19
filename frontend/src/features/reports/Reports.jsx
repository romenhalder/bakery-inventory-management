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
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
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

const PRIMARY = [139, 69, 19];
const COLORS = ['#8B4513', '#D2691E', '#DAA520', '#228B22', '#4682B4', '#6A5ACD', '#C71585', '#FF4500', '#2E8B57', '#1E90FF'];

const Reports = () => {
  const dispatch = useDispatch();
  const { analytics, stockReport, salesReport, usageReport, loading, error } = useSelector((state) => state.reports);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics && !loading) {
      dispatch(fetchAnalytics());
    }
  }, [activeTab, analytics, loading, dispatch]);

  const handleGenerateReport = () => {
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

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
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);
    dispatch(downloadReportCSV({ type: activeTab, startDate: start.toISOString(), endDate: end.toISOString() }));
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper function to calculate percentage
  const calculatePercentage = (value, total) => {
    const v = Number(value || 0);
    const t = Number(total || 1);
    if (t === 0) return '0%';
    return ((v / t) * 100).toFixed(1) + '%';
  };

  // =========================
  // Professional Footer
  // =========================

  const addProfessionalFooter = (doc, additionalInfo = '') => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(139, 69, 19);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      
      // Left - Generation info
      doc.text(`Generated: ${new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 14, pageHeight - 8);
      
      // Center - Confidential
      doc.setFont('helvetica', 'italic');
      doc.text('Bakery Inventra - Internal Use Only', pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      // Right - Page number
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }
  };

  // =========================
  // Analytics PDF - Clean & Simple
  // =========================

  const downloadAnalyticsPdf = () => {
    if (!analytics) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Clean Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BAKERY INVENTRA', 14, 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Inventory Analytics Report', 14, 24);
    
    doc.setFontSize(9);
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }), pageWidth - 14, 15, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    y = 50;

    // =====================
    // SALES SUMMARY SECTION
    // =====================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Sales Summary', 14, y);
    y += 8;

    // Sales Summary Table
    autoTable(doc, {
      startY: y,
      head: [['Period', 'Revenue', 'Orders']],
      body: [
        ['Today', formatCurrency(analytics.todaySales), String(analytics.todayOrderCount || 0)],
        ['This Week', formatCurrency(analytics.weekSales), String(analytics.weekOrderCount || 0)],
        ['This Month', formatCurrency(analytics.monthSales), String(analytics.monthOrderCount || 0)],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 69, 19], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 10, halign: 'center' },
      columnStyles: {
        1: { halign: 'right' },
      },
      alternateRowStyles: { fillColor: [253, 245, 230] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    y = doc.lastAutoTable.finalY + 15;

    // =====================
    // STOCK OVERVIEW SECTION
    // =====================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Stock Overview', 14, y);
    y += 8;

    // Stock Overview Table
    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count', 'Percentage']],
      body: [
        ['In Stock', String(analytics.inStockCount || 0), calculatePercentage(analytics.inStockCount, analytics.totalProducts)],
        ['Low Stock', String(analytics.lowStockCount || 0), calculatePercentage(analytics.lowStockCount, analytics.totalProducts)],
        ['Out of Stock', String(analytics.outOfStockCount || 0), calculatePercentage(analytics.outOfStockCount, analytics.totalProducts)],
        ['Total Products', String(analytics.totalProducts || 0), '100%'],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [34, 139, 34], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 10, halign: 'center' },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'center' },
      },
      alternateRowStyles: { fillColor: [245, 255, 245] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    y = doc.lastAutoTable.finalY + 15;

    // =====================
    // INVENTORY MOVEMENT SECTION
    // =====================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Inventory Movement (Last 30 Days)', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Movement Type', 'Quantity']],
      body: [
        ['Stock In', String(analytics.monthStockIn || 0)],
        ['Stock Out', String(analytics.monthStockOut || 0)],
        ['Wastage (30 Days)', String(analytics.monthWastage || 0)],
        ['Wastage (7 Days)', String(analytics.weekWastage || 0)],
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [70, 130, 180], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 10, halign: 'center' },
      columnStyles: {
        1: { halign: 'center' },
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    y = doc.lastAutoTable.finalY + 15;

    // =====================
    // TOP SELLING PRODUCTS
    // =====================
    if (analytics.topProducts && analytics.topProducts.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Top Selling Products (Last 30 Days)', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Product Name', 'Quantity Sold', 'Revenue']],
        body: analytics.topProducts.map((p, i) => [
          String(i + 1),
          p.name || 'Unknown',
          String(p.quantity || 0),
          formatCurrency(p.revenue),
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 69, 19], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          2: { halign: 'center' },
          3: { halign: 'right' },
        },
        alternateRowStyles: { fillColor: [253, 245, 230] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 15;
    }

    // =====================
    // CATEGORY BREAKDOWN
    // =====================
    if (analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Sales by Category (Last 30 Days)', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Category', 'Items Sold', 'Revenue', '% Share']],
        body: analytics.categoryBreakdown.map((c) => {
          const totalRevenue = analytics.categoryBreakdown.reduce((sum, cat) => sum + Number(cat.revenue || 0), 0);
          const share = totalRevenue > 0 ? ((Number(c.revenue || 0) / totalRevenue) * 100).toFixed(1) : '0';
          return [
            c.category || 'Unknown',
            String(c.quantity || 0),
            formatCurrency(c.revenue),
            share + '%',
          ];
        }),
        theme: 'striped',
        headStyles: { 
          fillColor: [218, 165, 32], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'center' },
        },
        alternateRowStyles: { fillColor: [255, 250, 240] },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    addProfessionalFooter(doc, 'Bakery Inventra - Analytics Report');
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // =========================
  // Stock Report PDF - Clean & Simple
  // =========================

  const downloadStockPdf = () => {
    if (!stockReport) return;
    const doc = new jsPDF('l');
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Clean Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BAKERY INVENTRA', 14, 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Stock Report', 14, 24);
    
    doc.setFontSize(9);
    doc.text(`Period: ${stockReport.startDate} to ${stockReport.endDate}`, pageWidth - 14, 15, { align: 'right' });
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - 14, 22, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    y = 50;

    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Stock Summary', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Total Products', 'Finished Goods', 'Raw Materials', 'Total Stock Qty', 'Low Stock', 'Out of Stock']],
      body: [[
        String(stockReport.totalProducts || 0),
        String(stockReport.finishedGoods || 0),
        String(stockReport.rawMaterials || 0),
        String(stockReport.totalStockQuantity || 0),
        String(stockReport.lowStockCount || 0),
        String(stockReport.outOfStockCount || 0),
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 69, 19], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 11, halign: 'center' },
      alternateRowStyles: { fillColor: [253, 245, 230] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 15;

    // Inventory Details
    if (stockReport.inventoryDetails && stockReport.inventoryDetails.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Inventory Details', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Product Name', 'Category', 'Type', 'Current Stock', 'Min Stock', 'Status']],
        body: stockReport.inventoryDetails.map((item, i) => {
          const status = item.isOutOfStock ? 'Out of Stock' : item.isLowStock ? 'Low Stock' : 'In Stock';
          return [
            String(i + 1),
            item.productName || 'Unknown',
            item.categoryName || 'N/A',
            item.productType === 'FINISHED_GOOD' ? 'Finished' : 'Raw',
            String(item.currentQuantity || 0),
            String(item.minStockLevel || 0),
            status,
          ];
        }),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 69, 19], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
        },
        alternateRowStyles: { fillColor: [253, 245, 230] },
        margin: { left: 10, right: 10 },
        didParseCell: function(data) {
          if (data.column.index === 6 && data.section === 'body') {
            const status = data.cell.raw;
            if (status === 'Out of Stock') {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (status === 'Low Stock') {
              data.cell.styles.textColor = [245, 158, 11];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [22, 163, 74];
            }
          }
        },
      });
    }

    addProfessionalFooter(doc, `Stock Report: ${stockReport.startDate} to ${stockReport.endDate}`);
    doc.save(`stock-report-${stockReport.startDate}-to-${stockReport.endDate}.pdf`);
  };

  // =========================
  // Sales Report PDF - Clean & Simple
  // =========================

  const downloadSalesPdf = () => {
    if (!salesReport) return;
    const doc = new jsPDF('l');
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Clean Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BAKERY INVENTRA', 14, 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Report', 14, 24);
    
    doc.setFontSize(9);
    doc.text(`Period: ${salesReport.startDate} to ${salesReport.endDate}`, pageWidth - 14, 15, { align: 'right' });
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - 14, 22, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    y = 50;

    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Sales Summary', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Total Transactions', 'Stock In', 'Stock Out', 'Total Sales Amount']],
      body: [[
        String(salesReport.totalTransactions || 0),
        String(salesReport.totalStockIn || 0),
        String(salesReport.totalStockOut || 0),
        formatCurrency(salesReport.totalSalesAmount),
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [34, 139, 34], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 11, halign: 'center' },
      alternateRowStyles: { fillColor: [245, 255, 245] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 15;

    // Sales Details
    if (salesReport.salesDetails && salesReport.salesDetails.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Sales Details', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Product', 'Qty', 'Unit Price', 'Total Amount', 'User']],
        body: salesReport.salesDetails.map((s) => [
          new Date(s.transactionDate).toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric' 
          }),
          s.productName || 'Unknown',
          String(Math.abs(s.quantity || 0)),
          s.unitPrice ? formatCurrency(s.unitPrice) : '-',
          s.totalAmount ? formatCurrency(s.totalAmount) : '-',
          s.userName || '-',
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 69, 19], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        },
        alternateRowStyles: { fillColor: [253, 245, 230] },
        margin: { left: 10, right: 10 },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('No sales transactions found for this period.', pageWidth / 2, y + 20, { align: 'center' });
    }

    addProfessionalFooter(doc, `Sales Report: ${salesReport.startDate} to ${salesReport.endDate}`);
    doc.save(`sales-report-${salesReport.startDate}-to-${salesReport.endDate}.pdf`);
  };

  // =========================
  // Usage Report PDF - Clean & Simple
  // =========================

  const downloadUsagePdf = () => {
    if (!usageReport) return;
    const doc = new jsPDF('l');
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Clean Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BAKERY INVENTRA', 14, 15);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Usage Report', 14, 24);
    
    doc.setFontSize(9);
    doc.text(`Period: ${usageReport.startDate} to ${usageReport.endDate}`, pageWidth - 14, 15, { align: 'right' });
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - 14, 22, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    y = 50;

    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('Transaction Summary', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Total Transactions', 'Stock In', 'Stock Out', 'Adjustments', 'Wastage', 'Returns']],
      body: [[
        String(usageReport.totalTransactions || 0),
        String(usageReport.stockInCount || 0),
        String(usageReport.stockOutCount || 0),
        String(usageReport.adjustmentCount || 0),
        String(usageReport.wastageCount || 0),
        String(usageReport.returnCount || 0),
      ]],
      theme: 'grid',
      headStyles: { 
        fillColor: [70, 130, 180], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: { fontSize: 11, halign: 'center' },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 15;

    // Transaction Details
    if (usageReport.transactionDetails && usageReport.transactionDetails.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(139, 69, 19);
      doc.text('Transaction Details', 14, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Date', 'Product', 'Type', 'Qty', 'Previous Qty', 'New Qty', 'User', 'Reason']],
        body: usageReport.transactionDetails.map((t) => [
          new Date(t.transactionDate).toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric' 
          }),
          t.productName || 'Unknown',
          t.transactionType ? t.transactionType.replace(/_/g, ' ') : '-',
          String(t.quantity || 0),
          String(t.previousQuantity || 0),
          String(t.newQuantity || 0),
          t.userName || '-',
          t.reason || '-',
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [139, 69, 19], 
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
        },
        alternateRowStyles: { fillColor: [253, 245, 230] },
        margin: { left: 10, right: 10 },
        didParseCell: function(data) {
          if (data.column.index === 2 && data.section === 'body') {
            const type = data.cell.raw;
            if (type === 'STOCK IN') {
              data.cell.styles.textColor = [22, 163, 74];
            } else if (type === 'STOCK OUT') {
              data.cell.styles.textColor = [37, 99, 235];
            } else if (type === 'WASTAGE') {
              data.cell.styles.textColor = [220, 38, 38];
            } else if (type === 'RETURN') {
              data.cell.styles.textColor = [139, 92, 246];
            }
          }
        },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('No transactions found for this period.', pageWidth / 2, y + 20, { align: 'center' });
    }

    addProfessionalFooter(doc, `Usage Report: ${usageReport.startDate} to ${usageReport.endDate}`);
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

  const getReportStatus = (tab) => {
    switch (tab) {
      case 'stock': return stockReport ? 'ready' : 'empty';
      case 'sales': return salesReport ? 'ready' : 'empty';
      case 'usage': return usageReport ? 'ready' : 'empty';
      default: return 'ready';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Business insights and downloadable reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={loading || (activeTab !== 'analytics' && getReportStatus(activeTab) === 'empty')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const status = getReportStatus(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'analytics') dispatch(clearReports());
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white shadow-md'
                    : 'text-gray-500 hover:text-[#8B4513] hover:bg-[#FDF5E6]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id !== 'analytics' && status === 'ready' && (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                )}
                {tab.id !== 'analytics' && status === 'empty' && (
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                )}
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
                disabled={loading || getReportStatus(activeTab) === 'empty'}
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

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Error Loading Analytics</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Products', value: stockReport.totalProducts, bg: 'bg-blue-50', text: 'text-blue-700', icon: CubeIcon },
              { label: 'Finished Goods', value: stockReport.finishedGoods, bg: 'bg-green-50', text: 'text-green-700', icon: ShoppingBagIcon },
              { label: 'Raw Materials', value: stockReport.rawMaterials, bg: 'bg-purple-50', text: 'text-purple-700', icon: CubeIcon },
              { label: 'Low Stock', value: stockReport.lowStockCount, bg: 'bg-amber-50', text: 'text-amber-700', icon: ExclamationTriangleIcon },
              { label: 'Out of Stock', value: stockReport.outOfStockCount, bg: 'bg-red-50', text: 'text-red-700', icon: XCircleIcon },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${s.text}`} />
                    <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  </div>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
              <span className="text-sm text-gray-500">{stockReport.inventoryDetails?.length || 0} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Product', 'Category', 'Type', 'Stock', 'Min Stock', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockReport.inventoryDetails?.map((item) => (
                    <tr key={item.id || item.productId} className="hover:bg-[#FDF5E6]/50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.categoryName}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.productType === 'FINISHED_GOOD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.productType === 'FINISHED_GOOD' ? 'Finished' : 'Raw'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold">{item.currentQuantity}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{item.minStockLevel || 0}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          item.isOutOfStock ? 'bg-red-100 text-red-700' :
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
              { label: 'Stock In', value: salesReport.totalStockIn, bg: 'bg-blue-50', text: 'text-blue-700', icon: ArrowPathIcon },
              { label: 'Stock Out', value: salesReport.totalStockOut, bg: 'bg-green-50', text: 'text-green-700', icon: ShoppingBagIcon },
              { label: 'Sales Amount', value: formatCurrency(salesReport.totalSalesAmount), bg: 'bg-purple-50', text: 'text-purple-700', icon: CurrencyRupeeIcon },
              { label: 'Transactions', value: salesReport.totalTransactions, bg: 'bg-amber-50', text: 'text-amber-700', icon: ChartBarIcon },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${s.text}`} />
                    <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${s.text} mt-1`}>{s.value}</p>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Sales Details</h3>
              <span className="text-sm text-gray-500">{salesReport.salesDetails?.length || 0} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Product', 'Qty', 'Unit Price', 'Total', 'User', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesReport.salesDetails?.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#FDF5E6]/50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {new Date(sale.transactionDate).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-800">{sale.productName}</td>
                      <td className="px-5 py-3 text-sm font-semibold">{Math.abs(sale.quantity)}</td>
                      <td className="px-5 py-3 text-sm">{sale.unitPrice ? formatCurrency(sale.unitPrice) : '-'}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[#8B4513]">{sale.totalAmount ? formatCurrency(sale.totalAmount) : '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{sale.userName || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircleIcon className="h-3 w-3" />
                          Completed
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
      {/* USAGE REPORT TAB    */}
      {/* =================== */}
      {activeTab === 'usage' && usageReport && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: usageReport.totalTransactions, bg: 'bg-blue-50', text: 'text-blue-700', icon: ChartBarIcon },
              { label: 'Stock In', value: usageReport.stockInCount, bg: 'bg-green-50', text: 'text-green-700', icon: ArrowPathIcon },
              { label: 'Stock Out', value: usageReport.stockOutCount, bg: 'bg-blue-50', text: 'text-blue-700', icon: ShoppingBagIcon },
              { label: 'Adjustments', value: usageReport.adjustmentCount, bg: 'bg-purple-50', text: 'text-purple-700', icon: ArrowPathIcon },
              { label: 'Wastage', value: usageReport.wastageCount, bg: 'bg-red-50', text: 'text-red-700', icon: ExclamationTriangleIcon },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${s.text}`} />
                    <p className="text-xs font-medium text-gray-500">{s.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
              <span className="text-sm text-gray-500">{usageReport.transactionDetails?.length || 0} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Product', 'Type', 'Qty', 'Previous', 'New', 'User', 'Reason'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usageReport.transactionDetails?.map((trans) => (
                    <tr key={trans.id} className="hover:bg-[#FDF5E6]/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(trans.transactionDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{trans.productName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          trans.transactionType === 'STOCK_IN' ? 'bg-green-100 text-green-700' :
                          trans.transactionType === 'STOCK_OUT' ? 'bg-blue-100 text-blue-700' :
                          trans.transactionType === 'ADJUSTMENT' ? 'bg-purple-100 text-purple-700' :
                          trans.transactionType === 'WASTAGE' ? 'bg-red-100 text-red-700' :
                          trans.transactionType === 'RETURN' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {trans.transactionType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{trans.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{trans.previousQuantity || 0}</td>
                      <td className="px-4 py-3 text-sm font-medium">{trans.newQuantity || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{trans.userName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[150px]">{trans.reason || '-'}</td>
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
          <div className="w-20 h-20 bg-[#FDF5E6] rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="h-10 w-10 text-[#8B4513]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-500">Generate Your Report</h3>
          <p className="text-sm text-gray-400 mt-2">Select a date range above and click Generate to view your {activeTab} report</p>
        </div>
      )}

      {/* Loading for report tabs */}
      {activeTab !== 'analytics' && loading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B4513] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500">Generating report...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
