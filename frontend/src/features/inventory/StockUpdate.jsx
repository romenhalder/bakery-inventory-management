import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateStock, clearSuccess, clearError } from './inventorySlice';
import { fetchProducts } from '../products/productSlice';

const StockUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedProductId = location.state?.productId;
  const defaultType = location.state?.defaultType || 'STOCK_IN';

  const { products } = useSelector((state) => state.products);
  const { loading, success, error } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    productId: preselectedProductId || '',
    quantity: '',
    type: defaultType,
    reason: '',
    unitPrice: '',
    referenceNumber: '',
    batchNumber: '',
    expiryDate: '',
    notes: '',
  });

  // Price verification state for STOCK_IN
  const [showPriceChange, setShowPriceChange] = useState(false);
  const [newCostPrice, setNewCostPrice] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
    return () => {
      dispatch(clearSuccess());
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      navigate('/inventory');
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Reset price change when product changes
    if (name === 'productId') {
      setShowPriceChange(false);
      setNewCostPrice('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };

    // If price changed on stock in, send the new cost price as unitPrice
    if (formData.type === 'STOCK_IN' && showPriceChange && newCostPrice) {
      submitData.unitPrice = parseFloat(newCostPrice);
    }

    dispatch(updateStock(submitData));
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
  const isRawMaterial = selectedProduct?.productType === 'RAW_MATERIAL';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#8B4513] mb-6">Update Stock</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Product *</label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            className="input-field mt-1"
          >
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} {product.productType === 'RAW_MATERIAL' ? '(Raw)' : ''} (Current: {product.currentStock || 0} {product.unitOfMeasure || 'units'})
              </option>
            ))}
          </select>
          {selectedProduct && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong>{selectedProduct.name}</strong> • Type: {selectedProduct.productType === 'RAW_MATERIAL' ? 'Raw Material' : 'Finished Good'}
              {selectedProduct.costPrice && ` • Cost: ₹${selectedProduct.costPrice}`}
              {!isRawMaterial && selectedProduct.sellingPrice && ` • Sell: ₹${selectedProduct.sellingPrice}`}
            </div>
          )}
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Transaction Type *</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { value: 'STOCK_IN', label: 'Stock In', color: 'bg-green-100 text-green-800' },
              { value: 'STOCK_OUT', label: 'Stock Out', color: 'bg-red-100 text-red-800' },
              { value: 'ADJUSTMENT', label: 'Adjustment', color: 'bg-blue-100 text-blue-800' },
              { value: 'RETURN', label: 'Return', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'WASTAGE', label: 'Wastage', color: 'bg-orange-100 text-orange-800' },
            ].map((type) => (
              <label
                key={type.value}
                className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all ${formData.type === type.value
                  ? 'border-[#8B4513] bg-[#FDF5E6]'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className={`text-sm font-medium ${type.color} px-2 py-1 rounded`}>
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity * {selectedProduct && `(${selectedProduct.unitOfMeasure || 'units'})`}
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="1"
            className="input-field mt-1"
            placeholder={`Enter quantity to ${formData.type === 'STOCK_IN' ? 'add' : 'remove'}`}
          />
          {selectedProduct && formData.type === 'STOCK_OUT' && (
            <p className="mt-1 text-sm text-gray-500">
              Available: {selectedProduct.availableStock || 0} {selectedProduct.unitOfMeasure || 'units'}
            </p>
          )}
        </div>

        {/* STOCK_IN: Price Verification */}
        {formData.type === 'STOCK_IN' && selectedProduct && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Price Verification</p>
                <p className="text-xs text-blue-600">Current cost price: <strong>₹{selectedProduct.costPrice || 0}</strong></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!showPriceChange}
                  onChange={() => { setShowPriceChange(false); setNewCostPrice(''); }}
                  className="text-[#8B4513]"
                />
                Same price (₹{selectedProduct.costPrice || 0})
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={showPriceChange}
                  onChange={() => setShowPriceChange(true)}
                  className="text-[#8B4513]"
                />
                Different price
              </label>
            </div>
            {showPriceChange && (
              <div>
                <label className="block text-sm font-medium text-blue-700">New Cost Price (for this batch)</label>
                <input
                  type="number"
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  className="input-field mt-1"
                  placeholder="Enter new cost price per unit"
                />
                <p className="text-xs text-blue-500 mt-1">This updates only the cost for the newly added quantity.</p>
              </div>
            )}
          </div>
        )}

        {/* Unit Price / Selling Price (for STOCK_OUT) — HIDDEN for raw materials */}
        {formData.type === 'STOCK_OUT' && !isRawMaterial && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Selling Price (Optional)</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              step="0.01"
              className="input-field mt-1"
              placeholder="Enter unit price for this sale"
            />
          </div>
        )}

        {/* Raw material stock out notice */}
        {formData.type === 'STOCK_OUT' && isRawMaterial && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ℹ️ <strong>Raw Material</strong> — No selling price required for raw materials. Stock will be deducted at cost price.
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="input-field mt-1"
            placeholder="e.g., Regular sale, Received from supplier, Damaged goods"
          />
        </div>

        {/* Reference & Batch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference Number</label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Invoice #, Order #, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch Number</label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Batch/Lot number"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            type="datetime-local"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="input-field mt-1"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="input-field mt-1"
            placeholder="Any additional information..."
          />
        </div>

        {/* Summary */}
        {selectedProduct && formData.quantity && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Summary</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Product:</span> {selectedProduct.name}</p>
              <p><span className="text-gray-600">Current Stock:</span> {selectedProduct.currentStock || 0}</p>
              <p>
                <span className="text-gray-600">New Stock:</span>{' '}
                <span className={`font-medium ${['STOCK_IN', 'ADJUSTMENT'].includes(formData.type) ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {['STOCK_IN', 'ADJUSTMENT'].includes(formData.type)
                    ? (selectedProduct.currentStock || 0) + parseInt(formData.quantity || 0)
                    : (selectedProduct.currentStock || 0) - parseInt(formData.quantity || 0)
                  }
                </span>
              </p>
              {showPriceChange && newCostPrice && (
                <p>
                  <span className="text-gray-600">New Cost Price:</span>{' '}
                  <span className="font-medium text-blue-600">₹{newCostPrice}</span> (for {formData.quantity} units)
                </p>
              )}
              {formData.unitPrice && (
                <p>
                  <span className="text-gray-600">Total Amount:</span>{' '}
                  ₹{(parseFloat(formData.unitPrice) * parseInt(formData.quantity)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-medium ${formData.type === 'STOCK_IN'
              ? 'bg-green-600 hover:bg-green-700'
              : formData.type === 'STOCK_OUT'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Update Stock'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockUpdate;
