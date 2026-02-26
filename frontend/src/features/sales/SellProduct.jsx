import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, searchProducts } from '../products/productSlice';
import {
  addToCart,
  removeFromCart,
  clearCart,
  createSale,
  fetchTodaySummary,
  clearError,
  clearSuccess
} from '../sales/salesSlice';

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
  const [currentSale, setCurrentSale] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [recentCustomers, setRecentCustomers] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchTodaySummary());
    fetchRecentCustomers();
  }, [dispatch]);

  useEffect(() => {
    if (success && currentSale) {
      setShowBill(true);
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
    if (!product.isSellable) {
      alert('This product is not for sale');
      return;
    }
    if (product.availableStock <= 0) {
      alert('Product is out of stock');
      return;
    }
    dispatch(addToCart({ product, quantity }));
  };

  const handleQuickAdd = (product, qty) => {
    handleAddToCart(product, qty);
  };

  const handleQuantityChange = (productId, quantity, newQty) => {
    const product = products.find(p => p.id === productId);
    if (newQty > 0 && newQty <= (product?.availableStock || 0)) {
      dispatch(addToCart({ product, quantity: newQty }));
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
    // Auto-fill customer name if we have previous orders
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
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

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
    setCurrentSale(null);
    dispatch(clearCart());
    setCustomerName('');
    setCustomerMobile('');
    dispatch(fetchProducts());
    dispatch(fetchTodaySummary());
  };

  const filteredProducts = products.filter(p =>
    p.isActive && p.isSellable && (p.availableStock > 0)
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">🧁 POS - Sell Product</h1>
            <span className="text-sm text-gray-500">Sold by: {user?.fullName}</span>
          </div>
          <div className="flex gap-4">
            {user?.role !== 'EMPLOYEE' && (
              <>
                <div className="bg-white px-4 py-2 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  <p className="text-xl font-bold text-green-600">₹{todaySummary?.totalSales || 0}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-xl font-bold text-blue-600">{todaySummary?.transactionCount || 0}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())} className="font-bold">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products by name, SKU, or barcode... (Ctrl+K)"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-3 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Ctrl+K</span>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex gap-2 mb-4 text-xs text-gray-600">
                <span>Quick Add:</span>
                <button onClick={() => filteredProducts[0] && handleQuickAdd(filteredProducts[0], 1)} className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">+1</button>
                <button onClick={() => filteredProducts[0] && handleQuickAdd(filteredProducts[0], 2)} className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">+2</button>
                <button onClick={() => filteredProducts[0] && handleQuickAdd(filteredProducts[0], 5)} className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">+5</button>
                <button onClick={() => filteredProducts[0] && handleQuickAdd(filteredProducts[0], 10)} className="bg-blue-100 px-2 py-1 rounded hover:bg-blue-200">+10</button>
              </div>

              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[450px] overflow-y-auto">
                  {filteredProducts.slice(0, 50).map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-2 hover:shadow-md cursor-pointer transition hover:border-blue-400 bg-gray-50"
                      onClick={() => handleAddToCart(product)}
                    >
                      <div className="font-semibold text-sm truncate">{product.name}</div>
                      <div className="text-xs text-gray-500 truncate">{product.sku || product.brandName || product.categoryName}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-blue-600 font-bold">₹{product.price}</span>
                        <span className={`text-xs ${product.availableStock < product.minStockLevel ? 'text-red-500 font-medium' : 'text-green-500'}`}>
                          {product.availableStock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredProducts.length > 50 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Showing 50 of {filteredProducts.length} products. Use search to find more.
                </p>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow p-4 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">🛒 Cart ({calculateItemCount()} items)</h2>
              {cart.length > 0 && (
                <button onClick={handleClearCart} className="text-sm text-red-600 hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* Customer Details */}
            <div className="mb-3 space-y-2">
              <input
                type="text"
                placeholder="Customer Mobile (Optional)"
                value={customerMobile}
                onChange={handleCustomerMobileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {recentCustomers.length > 0 && customerMobile === '' && (
                <div className="flex gap-1 flex-wrap">
                  {recentCustomers.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomerMobile(c.customerMobile);
                        setCustomerName(c.customerName || '');
                      }}
                      className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      {c.customerMobile}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="max-h-[280px] overflow-y-auto mb-3 border-t">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">
                  🛒 Cart is empty<br />
                  <span className="text-xs">Click products to add</span>
                </p>
              ) : (
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.productId} className="py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-500">₹{item.unitPrice} each</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{item.totalPrice}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="CASH">💵 Cash</option>
                <option value="CARD">💳 Card</option>
                <option value="UPI">📱 UPI</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
              </select>
            </div>

            {/* Total and Checkout */}
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold mb-3">
                <span>Total:</span>
                <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || salesLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold text-lg"
                >
                  {salesLoading ? '⏳' : '💰 Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Modal */}
        {showBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <div className="text-center border-b-2 border-dashed pb-4 mb-4">
                <h2 className="text-3xl font-bold text-[#8B4513]">🧁 Bakery</h2>
                <p className="text-gray-500">Thank you for your purchase!</p>
              </div>

              <div className="mb-4 text-sm space-y-1">
                <p><strong>Order:</strong> {currentSale?.orderNumber || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                {customerMobile && <p><strong>Mobile:</strong> {customerMobile}</p>}
                {customerName && <p><strong>Customer:</strong> {customerName}</p>}
                <p><strong>Sold By:</strong> {user?.fullName}</p>
              </div>

              <div className="border-t border-b py-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td className="py-1">{item.productName}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">₹{item.unitPrice}</td>
                        <td className="py-1 text-right">₹{item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right font-bold text-xl mb-6">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleNewSale}
                  className="flex-1 px-4 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] font-bold"
                >
                  ➕ New Sale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellProduct;
