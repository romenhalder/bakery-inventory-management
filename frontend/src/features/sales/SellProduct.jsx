import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, searchProducts } from '../products/productSlice';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createSale,
  fetchTodaySummary,
  clearError,
  clearSuccess
} from '../sales/salesSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SellProduct = () => {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const { products, loading: productsLoading } = useSelector((state) => state.products);
  const { cart, loading: salesLoading, error, success, todaySummary } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [showBill, setShowBill] = useState(false);
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [billCart, setBillCart] = useState([]);
  const [billTotal, setBillTotal] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchTodaySummary());
    fetchRecentCustomers();
  }, [dispatch]);

  useEffect(() => {
    if (success && currentSale) {
      // billCart and billTotal are already set in handleCheckout BEFORE dispatch
      setShowPaymentAnimation(true);
      setTimeout(() => {
        setShowPaymentAnimation(false);
        setShowBill(true);
      }, 2500);
      dispatch(fetchTodaySummary());
    }
  }, [success, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const fetchRecentCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/sales/recent?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const sales = await response.json();
        const uniqueCustomers = [...new Map(sales.map(s => [s.customerMobile, s]))
          .values()].filter(s => s.customerMobile);
        setRecentCustomers(uniqueCustomers.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch recent customers', err);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      dispatch(searchProducts(term));
    } else if (term.length === 0) {
      dispatch(fetchProducts());
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (!product.isSellable) return;
    if (product.availableStock <= 0) return;
    dispatch(addToCart({ product, quantity }));
  };

  const handleQuantityChange = (productId, quantity, newQty) => {
    const product = products.find(p => p.id === productId);
    if (newQty > 0 && newQty <= (product?.availableStock || 0)) {
      dispatch(updateCartItem({ productId, quantity: newQty }));
    } else if (newQty <= 0) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setCustomerName('');
    setCustomerMobile('');
  };

  const handleCustomerMobileChange = (e) => {
    const mobile = e.target.value;
    setCustomerMobile(mobile);
    const existingCustomer = recentCustomers.find(c => c.customerMobile === mobile);
    if (existingCustomer && existingCustomer.customerName) {
      setCustomerName(existingCustomer.customerName);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // IMPORTANT: snapshot cart data BEFORE dispatching, because
    // createSale.fulfilled clears the cart in Redux
    setBillCart([...cart]);
    setBillTotal(cart.reduce((sum, item) => sum + item.totalPrice, 0));
    setCurrentSale({ orderNumber: 'SAL-' + Date.now() });

    const saleData = {
      customerName,
      customerMobile,
      paymentMethod,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    dispatch(createSale(saleData));
  };

  const handleNewSale = () => {
    setShowBill(false);
    setShowPaymentAnimation(false);
    setCurrentSale(null);
    setBillCart([]);
    setBillTotal(0);
    dispatch(clearCart());
    dispatch(clearSuccess());
    setCustomerName('');
    setCustomerMobile('');
    dispatch(fetchProducts());
    dispatch(fetchTodaySummary());
  };

  const downloadBillPDF = () => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, w, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('🧁 Bakery', w / 2, 16, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tax Invoice / Bill of Supply', w / 2, 26, { align: 'center' });

    let y = 45;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Order info
    doc.setFont('helvetica', 'bold');
    doc.text('Order #:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(currentSale?.orderNumber || 'N/A', 50, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', w / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString(), w / 2 + 30, y);
    y += 7;

    if (customerName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Customer:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(customerName, 50, y);
      y += 7;
    }
    if (customerMobile) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mobile:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(customerMobile, 50, y);
      y += 7;
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Sold By:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.fullName || '', 50, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment:', w / 2 + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentMethod, w / 2 + 40, y);
    y += 10;

    // Items table
    autoTable(doc, {
      startY: y,
      head: [['#', 'Item', 'Qty', 'Price', 'Total']],
      body: billCart.map((item, i) => [
        String(i + 1),
        item.productName,
        String(item.quantity),
        '₹' + Number(item.unitPrice).toFixed(2),
        '₹' + Number(item.totalPrice).toFixed(2),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [253, 245, 230] },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Total
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.5);
    doc.line(w / 2, y, w - 14, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', w / 2 + 5, y);
    doc.setTextColor(139, 69, 19);
    doc.text('₹' + billTotal.toFixed(2), w - 14, y, { align: 'right' });

    // Footer
    y += 20;
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your purchase! Visit again 🧁', w / 2, y, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, w / 2, y + 6, { align: 'center' });

    doc.save(`bill-${currentSale?.orderNumber || 'receipt'}.pdf`);
  };

  const filteredProducts = products.filter(p =>
    p.isActive && p.isSellable && (p.availableStock > 0) && p.productType !== 'RAW_MATERIAL'
  );

  // Focus search on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: '💵' },
    { value: 'CARD', label: 'Card', icon: '💳' },
    { value: 'UPI', label: 'UPI', icon: '📱' },
    { value: 'BANK_TRANSFER', label: 'Bank', icon: '🏦' },
  ];

  const formatCurrency = (amount) => '₹' + Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
              Point of Sale
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Sold by: <span className="font-medium">{user?.fullName}</span></p>
          </div>
          {user?.role !== 'EMPLOYEE' && (
            <div className="flex gap-3">
              <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Today's Revenue</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(todaySummary?.totalSales)}</p>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Orders</p>
                <p className="text-lg font-bold text-blue-600">{todaySummary?.transactionCount || 0}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center animate-pulse">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())} className="font-bold text-red-400 hover:text-red-600">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Product Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              {/* Search */}
              <div className="relative mb-4">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products by name or code... (Ctrl+K)"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B4513]/30 focus:border-[#8B4513] transition-all"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="absolute right-3 top-3.5 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">Ctrl+K</span>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#8B4513] border-t-transparent"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">🧁</p>
                  <p className="font-medium">No products available</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredProducts.slice(0, 60).map((product) => {
                    const inCart = cart.find(c => c.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`relative border rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${inCart ? 'border-[#8B4513] bg-[#FDF5E6]' : 'border-gray-100 bg-white hover:border-[#DAA520]'
                          }`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {inCart && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#8B4513] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                            {inCart.quantity}
                          </div>
                        )}
                        <div className="font-semibold text-sm text-gray-800 truncate">{product.name}</div>
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {product.brandName || product.categoryName}
                          {product.flavorName && ` • ${product.flavorName}`}
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-[#8B4513] font-bold text-sm">{formatCurrency(product.price)}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${product.availableStock <= product.minStockLevel
                            ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                            {product.availableStock} left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredProducts.length > 60 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing 60 of {filteredProducts.length} products — use search to find more
                </p>
              )}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  🛒 Cart <span className="text-sm font-normal text-gray-400">({calculateItemCount()} items)</span>
                </h2>
                {cart.length > 0 && (
                  <button onClick={handleClearCart} className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer */}
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="📱 Customer Mobile (Optional)"
                  value={customerMobile}
                  onChange={handleCustomerMobileChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
                />
                <input
                  type="text"
                  placeholder="👤 Customer Name (Optional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
                />
                {recentCustomers.length > 0 && customerMobile === '' && (
                  <div className="flex gap-1 flex-wrap">
                    {recentCustomers.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { setCustomerMobile(c.customerMobile); setCustomerName(c.customerName || ''); }}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-[#FDF5E6] hover:text-[#8B4513] transition-colors"
                      >
                        {c.customerMobile}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="max-h-[250px] overflow-y-auto mb-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-300">
                    <p className="text-3xl mb-2">🛒</p>
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs">Click products to add</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg group hover:bg-[#FDF5E6] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{item.productName}</div>
                        <div className="text-xs text-gray-400">{formatCurrency(item.unitPrice)} each</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center bg-white rounded-lg border shadow-sm">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.productId, item.quantity, item.quantity - 1); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                          >−</button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleQuantityChange(item.productId, item.quantity, item.quantity + 1); }}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-r-lg transition-colors"
                          >+</button>
                        </div>
                        <span className="text-sm font-bold text-[#8B4513] w-16 text-right">{formatCurrency(item.totalPrice)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(item.productId); }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all ml-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`py-2 rounded-lg text-center transition-all ${paymentMethod === pm.value
                        ? 'bg-[#8B4513] text-white shadow-md scale-105'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <div className="text-lg">{pm.icon}</div>
                      <div className="text-[10px] font-medium mt-0.5">{pm.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Checkout */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-[#8B4513]">{formatCurrency(calculateTotal())}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || salesLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {salesLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>💰 Checkout — {formatCurrency(calculateTotal())}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* PAYMENT SUCCESS ANIMATION OVERLAY         */}
        {/* ========================================= */}
        {showPaymentAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center animate-[fadeInUp_0.5s_ease-out]">
              {/* Animated checkmark */}
              <div className="relative mx-auto mb-6">
                <div className="w-28 h-28 rounded-full bg-emerald-500 mx-auto flex items-center justify-center shadow-2xl animate-[scaleIn_0.5s_ease-out]">
                  <svg className="w-16 h-16 text-white animate-[drawCheck_0.6s_ease-out_0.3s_both]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Confetti particles */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-[confetti_1s_ease-out_forwards]"
                    style={{
                      left: '50%',
                      top: '50%',
                      backgroundColor: ['#8B4513', '#DAA520', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'][i % 6],
                      animationDelay: `${0.2 + i * 0.05}s`,
                      transform: `rotate(${i * 30}deg) translateY(-60px)`,
                    }}
                  ></div>
                ))}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
                Payment Successful! 🎉
              </h2>
              <p className="text-white/70 text-sm animate-[fadeInUp_0.5s_ease-out_0.6s_both]">
                Order #{currentSale?.orderNumber}
              </p>
              <p className="text-emerald-400 font-bold text-xl mt-2 animate-[fadeInUp_0.5s_ease-out_0.7s_both]">
                {formatCurrency(billTotal)}
              </p>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* BILL MODAL                                */}
        {/* ========================================= */}
        {showBill && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-[fadeInUp_0.3s_ease-out]">
              {/* Bill Header */}
              <div className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white p-6 rounded-t-2xl text-center">
                <h2 className="text-2xl font-bold">🧁 Bakery</h2>
                <p className="text-white/80 text-sm mt-1">Tax Invoice</p>
              </div>

              {/* Bill Content */}
              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-5 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="text-gray-400 text-xs">Order</span>
                    <p className="font-semibold">{currentSale?.orderNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Date</span>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  {customerName && (
                    <div>
                      <span className="text-gray-400 text-xs">Customer</span>
                      <p className="font-semibold">{customerName}</p>
                    </div>
                  )}
                  {customerMobile && (
                    <div>
                      <span className="text-gray-400 text-xs">Mobile</span>
                      <p className="font-semibold">{customerMobile}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-xs">Sold By</span>
                    <p className="font-semibold">{user?.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs">Payment</span>
                    <p className="font-semibold">{paymentMethods.find(pm => pm.value === paymentMethod)?.icon} {paymentMethod}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="border-b-2 border-[#8B4513]/20">
                      <th className="pb-2 text-left text-xs text-gray-400 uppercase">Item</th>
                      <th className="pb-2 text-center text-xs text-gray-400 uppercase">Qty</th>
                      <th className="pb-2 text-right text-xs text-gray-400 uppercase">Price</th>
                      <th className="pb-2 text-right text-xs text-gray-400 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billCart.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2.5 font-medium">{item.productName}</td>
                        <td className="py-2.5 text-center text-gray-500">{item.quantity}</td>
                        <td className="py-2.5 text-right text-gray-500">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#FDF5E6] to-[#FAEBD7] rounded-xl">
                  <span className="text-lg font-bold text-gray-800">Grand Total</span>
                  <span className="text-2xl font-bold text-[#8B4513]">{formatCurrency(billTotal)}</span>
                </div>

                {/* Thank you */}
                <p className="text-center text-sm text-gray-400 mt-4">Thank you for your purchase! Visit again 🧁</p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-2">
                <div className="flex gap-3">
                  <button
                    onClick={downloadBillPDF}
                    className="flex-1 py-3 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-3 px-5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    🖨️
                  </button>
                  <button
                    onClick={handleNewSale}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    ➕ New Sale
                  </button>
                </div>
                <button
                  onClick={handleNewSale}
                  className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                >
                  ← Back to POS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        @keyframes drawCheck {
          from { stroke-dasharray: 40; stroke-dashoffset: 40; }
          to { stroke-dasharray: 40; stroke-dashoffset: 0; }
        }
        @keyframes confetti {
          0% { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(0) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-120px) scale(0); }
        }
      `}</style>
    </div>
  );
};

export default SellProduct;
