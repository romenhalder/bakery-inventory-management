import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, fetchProductById, clearSuccess, clearError, fetchCategories } from './productSlice';
import { API_URL } from '../../config/api';

const UNIT_OPTIONS = [
  { value: 'PIECE', label: 'Piece' },
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'LITER', label: 'Liter (L)' },
  { value: 'ML', label: 'Milliliter (ml)' },
  { value: 'BOX', label: 'Box' },
  { value: 'PACK', label: 'Pack' },
];

const BRAND_OPTIONS = [
  // Premium Brands
  'Royal Oven', 'Sweet Palace', 'Golden Crumb', 'Cake Mahal', 'The Frosted Crown',
  'Urban Bakers', 'Velvet Bakes',
  // Budget / Daily Fresh
  'Daily Delight', 'Fresh Bite Bakery', 'Oven Fresh', 'Happy Treats',
  'Sweet Time', 'Bake & Take',
  // Designer / Custom
  'Dream Layers', 'Signature Cakes', 'Celebration Studio', 'Cake Couture', 'Elite Bakes',
  // Other
  'Amul', 'Britannia', 'Haldirams', 'Local Bakery', 'Homemade',
];

const FLAVOR_OPTIONS = [
  // Chocolate
  { group: '🍫 Chocolate', items: ['Chocolate Truffle', 'Dark Chocolate', 'Belgian Chocolate', 'Chocolate Fudge', 'Chocolate Chips', 'Chocolate Hazelnut', 'Chocolate Almond', 'Chocolate Oreo', 'Chocolate KitKat', 'Chocolate Ferrero Rocher'] },
  // Fruit
  { group: '🍓 Fruit', items: ['Strawberry', 'Pineapple', 'Mango', 'Mixed Fruit', 'Blueberry', 'Black Forest', 'White Forest', 'Litchi', 'Orange', 'Kiwi'] },
  // Indian Special
  { group: '🥭 Indian Special', items: ['Kesar Pista', 'Rasmalai Cake', 'Gulab Jamun Cake', 'Butterscotch', 'Paan Cake', 'Gulkand Cake', 'Rabri Cake', 'Motichoor Cake', 'Coconut', 'Elaichi Cream Cake'] },
  // Premium & Trending
  { group: '🍰 Premium', items: ['Red Velvet', 'Tiramisu', 'Coffee Mocha', 'Lotus Biscoff', 'Salted Caramel', 'Nutella', 'Ferrero Rocher', 'Oreo Cookies & Cream', 'German Chocolate', 'Choco Lava'] },
  // Cheesecake
  { group: '🧀 Cheesecake', items: ['Blueberry Cheesecake', 'Strawberry Cheesecake', 'Mango Cheesecake', 'Baked Cheesecake', 'Oreo Cheesecake', 'Chocolate Cheesecake'] },
  // Pastry
  { group: '🍪 Pastry', items: ['Chocolate Pastry', 'Pineapple Pastry', 'Butterscotch Pastry', 'Red Velvet Pastry', 'Black Forest Pastry', 'Fresh Fruit Pastry', 'KitKat Pastry', 'Rasmalai Pastry'] },
  // Basics
  { group: '🧁 Basic', items: ['Vanilla', 'Plain', 'Butter', 'Honey'] },
  // Festival Special
  { group: '🎉 Festival', items: ['Diwali Dry Fruit Cake', 'Christmas Plum Cake', 'Eid Sheer Khurma Cake', 'Valentine Heart Red Velvet', 'Holi Thandai Cake'] },
  // Eggless
  { group: '🥛 Eggless', items: ['Eggless Chocolate', 'Eggless Pineapple', 'Eggless Butterscotch', 'Eggless Red Velvet', 'Jain Cake'] },
];

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { currentProduct, loading, success, error, categories } = useSelector((state) => state.products);

  const [mode, setMode] = useState('quick'); // 'quick' or 'full'
  const [suppliers, setSuppliers] = useState([]);

  // Quick Add Form
  const [quickForm, setQuickForm] = useState({
    name: '',
    categoryId: '',
    productType: 'FINISHED_GOOD',
    unitOfMeasure: 'PIECE',
    initialStock: '',
    costPrice: '',
    price: '',
    pricingType: 'PER_UNIT',
    brandName: '',
    flavor: '',
    minStockLevel: 10,
    maxStockLevel: 1000,
    reorderPoint: 20,
    supplierId: '',
    manualSupplierName: '',
    manualSupplierContact: '',
  });

  // Full Form
  const [fullForm, setFullForm] = useState({
    name: '',
    description: '',
    productCode: '',
    sku: '',
    barcode: '',
    hsnCode: '',
    categoryId: '',
    productType: 'FINISHED_GOOD',
    unitOfMeasure: 'PIECE',
    brandName: '',
    flavor: '',
    weight: '',
    initialStock: '',
    costPrice: '',
    price: '',
    pricingType: 'PER_UNIT',
    taxRate: '0',
    minStockLevel: 10,
    maxStockLevel: 1000,
    reorderPoint: 20,
    expiryDays: '',
    isPerishable: false,
    isActive: true,
    isSellable: true,
    supplierId: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    fetchSuppliersList();
  }, [dispatch]);

  const fetchSuppliersList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSuccess());
      dispatch(clearError());
    };
  }, [isEditMode, id, dispatch]);

  useEffect(() => {
    if (isEditMode && currentProduct) {
      setFullForm({
        ...currentProduct,
        categoryId: currentProduct.categoryId,
        initialStock: currentProduct.currentStock || '',
        taxRate: currentProduct.taxRate?.toString() || '0',
        image: null,
      });
    }
  }, [isEditMode, currentProduct]);

  useEffect(() => {
    if (success) {
      navigate('/products');
    }
  }, [success, navigate]);

  const handleQuickChange = (e) => {
    const { name, value } = e.target;
    setQuickForm({ ...quickForm, [name]: value });
  };

  const handleFullChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFullForm({
      ...fullForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFullForm({ ...fullForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const buildFormData = (formData, isQuick) => {
    const data = new FormData();

    // Calculate final unit prices based on pricing strategy
    const stock = parseFloat(formData.initialStock || 0);
    const isBulk = formData.pricingType === 'TOTAL_BULK' && stock > 0;

    const finalCostPrice = isBulk
      ? (parseFloat(formData.costPrice) / stock).toFixed(2)
      : formData.costPrice;

    const finalPrice = isBulk && formData.price
      ? (parseFloat(formData.price) / stock).toFixed(2)
      : formData.price;

    const isRaw = formData.productType === 'RAW_MATERIAL';

    if (isQuick) {
      data.append('name', formData.name);
      data.append('categoryId', formData.categoryId);
      data.append('productType', formData.productType);
      data.append('unitOfMeasure', formData.unitOfMeasure);
      data.append('costPrice', finalCostPrice);
      data.append('price', finalPrice || '');
      data.append('initialStock', formData.initialStock || '0');
      data.append('isActive', 'true');
      data.append('isSellable', isRaw ? 'false' : 'true');
      if (formData.brandName) data.append('brandName', formData.brandName);
      if (formData.flavor) data.append('flavor', formData.flavor);
      data.append('minStockLevel', formData.minStockLevel || 10);
      data.append('maxStockLevel', formData.maxStockLevel || 1000);
      data.append('reorderPoint', formData.reorderPoint || 20);
      if (formData.supplierId) data.append('supplierId', formData.supplierId);
      if (!formData.supplierId && formData.manualSupplierName) {
        data.append('notes', `Supplier: ${formData.manualSupplierName}${formData.manualSupplierContact ? ' | Contact: ' + formData.manualSupplierContact : ''}`);
      }
    } else {
      Object.keys(formData).forEach((key) => {
        if (key === 'image' && formData[key]) {
          data.append(key, formData[key]);
        } else if (key === 'costPrice') {
          data.append('costPrice', finalCostPrice);
        } else if (key === 'price') {
          if (finalPrice !== null && finalPrice !== '') data.append('price', finalPrice);
        } else if (key === 'isSellable') {
          data.append('isSellable', isRaw ? 'false' : formData[key]);
        } else if (key !== 'pricingType' && formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
    }

    return data;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = mode === 'quick' ? quickForm : fullForm;
    const productData = buildFormData(formData, mode === 'quick');

    if (isEditMode) {
      dispatch(updateProduct({ id, productData }));
    } else {
      dispatch(createProduct(productData));
    }
  };

  const quickFormValid = () => {
    return quickForm.name && quickForm.categoryId && quickForm.costPrice;
  };

  const getUnitLabel = () => {
    const form = mode === 'quick' ? quickForm : fullForm;
    const unit = UNIT_OPTIONS.find(u => u.value === form.unitOfMeasure);
    return unit ? unit.label.toLowerCase() : 'pieces';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#8B4513] mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!isEditMode && (
        <div className="bg-white rounded-lg shadow mb-6 p-1">
          <div className="flex rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`flex-1 py-3 px-4 font-medium text-center ${mode === 'quick'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ⚡ Quick Add
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`flex-1 py-3 px-4 font-medium text-center ${mode === 'full'
                ? 'bg-[#8B4513] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              📝 Full Details
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Quick Add Mode */}
        {mode === 'quick' && !isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={quickForm.name}
                onChange={handleQuickChange}
                required
                className="input-field mt-1"
                placeholder="e.g., Chocolate Cake"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, productType: 'FINISHED_GOOD' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-semibold text-center transition-all ${quickForm.productType === 'FINISHED_GOOD'
                      ? 'border-[#8B4513] bg-[#FDF5E6] text-[#8B4513]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  🍰 Finished Good
                </button>
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, productType: 'RAW_MATERIAL', price: '' })}
                  className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-semibold text-center transition-all ${quickForm.productType === 'RAW_MATERIAL'
                      ? 'border-[#8B4513] bg-[#FDF5E6] text-[#8B4513]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  📦 Raw Material
                </button>
              </div>
              {quickForm.productType === 'RAW_MATERIAL' && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Raw materials are for storage only, not for billing/selling.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="categoryId"
                value={quickForm.categoryId}
                onChange={handleQuickChange}
                required
                className="input-field mt-1"
              >
                <option value="">Select Category</option>
                {categories && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit *</label>
              <select
                name="unitOfMeasure"
                value={quickForm.unitOfMeasure}
                onChange={handleQuickChange}
                className="input-field mt-1"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Initial Stock to Add
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="initialStock"
                  value={quickForm.initialStock}
                  onChange={handleQuickChange}
                  className="input-field pr-12"
                  placeholder="0"
                  min="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{getUnitLabel()}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How much stock you're adding right now
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Strategy</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeQuick"
                    value="PER_UNIT"
                    checked={quickForm.pricingType === 'PER_UNIT'}
                    onChange={(e) => setQuickForm({ ...quickForm, pricingType: e.target.value })}
                    className="mr-2"
                  />
                  Per Unit Pricing
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeQuick"
                    value="TOTAL_BULK"
                    checked={quickForm.pricingType === 'TOTAL_BULK'}
                    onChange={(e) => setQuickForm({ ...quickForm, pricingType: e.target.value })}
                    className="mr-2"
                  />
                  Total Bulk Pricing (for Initial Stock)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {quickForm.pricingType === 'TOTAL_BULK' ? 'Total Cost Price (Buy) *' : 'Unit Cost Price (Buy) *'}
              </label>
              <input
                type="number"
                name="costPrice"
                value={quickForm.costPrice}
                onChange={handleQuickChange}
                required
                step="0.01"
                className="input-field mt-1"
                placeholder="₹0.00"
              />
              {quickForm.pricingType === 'TOTAL_BULK' && quickForm.initialStock > 0 && quickForm.costPrice && (
                <p className="text-xs text-gray-500 mt-1">Per unit cost: ₹{(parseFloat(quickForm.costPrice) / parseFloat(quickForm.initialStock)).toFixed(2)}</p>
              )}
            </div>

            {quickForm.productType !== 'RAW_MATERIAL' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {quickForm.pricingType === 'TOTAL_BULK' ? 'Total Selling Price' : 'Unit Selling Price'}
                </label>
                <input
                  type="number"
                  name="price"
                  value={quickForm.price}
                  onChange={handleQuickChange}
                  step="0.01"
                  className="input-field mt-1"
                  placeholder="₹0.00"
                />
                {quickForm.pricingType === 'TOTAL_BULK' && quickForm.initialStock > 0 && quickForm.price && (
                  <p className="text-xs text-gray-500 mt-1">Per unit price: ₹{(parseFloat(quickForm.price) / parseFloat(quickForm.initialStock)).toFixed(2)}</p>
                )}
              </div>
            )}

            {/* Brand & Flavor - only for finished goods */}
            {quickForm.productType !== 'RAW_MATERIAL' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <select
                    name="brandName"
                    value={quickForm.brandName}
                    onChange={handleQuickChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select Brand (Optional)</option>
                    {BRAND_OPTIONS.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                    <option value="__custom">✏️ Custom / Other</option>
                  </select>
                  {quickForm.brandName === '__custom' && (
                    <input
                      type="text"
                      name="brandName"
                      value=""
                      onChange={handleQuickChange}
                      className="input-field mt-2"
                      placeholder="Enter custom brand name"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Flavor</label>
                  <select
                    name="flavor"
                    value={quickForm.flavor}
                    onChange={handleQuickChange}
                    className="input-field mt-1"
                  >
                    <option value="">Select Flavor (Optional)</option>
                    {FLAVOR_OPTIONS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.items.map((flavor) => (
                          <option key={flavor} value={flavor}>{flavor}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Threshold Fields */}
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700 mb-2">📊 Stock Thresholds</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Min Stock Level</label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={quickForm.minStockLevel}
                    onChange={handleQuickChange}
                    min="0"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Max Stock Level</label>
                  <input
                    type="number"
                    name="maxStockLevel"
                    value={quickForm.maxStockLevel}
                    onChange={handleQuickChange}
                    min="0"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Reorder Point</label>
                  <input
                    type="number"
                    name="reorderPoint"
                    value={quickForm.reorderPoint}
                    onChange={handleQuickChange}
                    min="0"
                    className="input-field mt-1"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Alert will trigger when stock falls below min level or reorder point.</p>
            </div>

            {/* Supplier Selection */}
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700 mb-2">🚚 Supplier</p>
              <select
                name="supplierId"
                value={quickForm.supplierId}
                onChange={handleQuickChange}
                className="input-field"
              >
                <option value="">Select Supplier (Optional)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} {s.phone ? `(${s.phone})` : ''}</option>
                ))}
              </select>
              {!quickForm.supplierId && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500">Supplier Name (if not in list)</label>
                    <input
                      type="text"
                      name="manualSupplierName"
                      value={quickForm.manualSupplierName}
                      onChange={handleQuickChange}
                      className="input-field mt-1"
                      placeholder="e.g., Sharma Flour Mill"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Supplier Contact</label>
                    <input
                      type="text"
                      name="manualSupplierContact"
                      value={quickForm.manualSupplierContact}
                      onChange={handleQuickChange}
                      className="input-field mt-1"
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Full Add Mode - Minimal version */}
        {(mode === 'full' || isEditMode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={fullForm.name}
                onChange={handleFullChange}
                required
                className="input-field mt-1"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="categoryId"
                value={fullForm.categoryId}
                onChange={handleFullChange}
                required
                className="input-field mt-1"
              >
                <option value="">Select Category</option>
                {categories && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit *</label>
              <select
                name="unitOfMeasure"
                value={fullForm.unitOfMeasure}
                onChange={handleFullChange}
                className="input-field mt-1"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Initial Stock to Add
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="initialStock"
                  value={fullForm.initialStock}
                  onChange={handleFullChange}
                  className="input-field pr-12"
                  placeholder="0"
                  min="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">{getUnitLabel()}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Strategy</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeFull"
                    value="PER_UNIT"
                    checked={fullForm.pricingType === 'PER_UNIT'}
                    onChange={(e) => setFullForm({ ...fullForm, pricingType: e.target.value })}
                    className="mr-2"
                  />
                  Per Unit Pricing
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pricingTypeFull"
                    value="TOTAL_BULK"
                    checked={fullForm.pricingType === 'TOTAL_BULK'}
                    onChange={(e) => setFullForm({ ...fullForm, pricingType: e.target.value })}
                    className="mr-2"
                  />
                  Total Bulk Pricing (for Initial Stock)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {fullForm.pricingType === 'TOTAL_BULK' ? 'Total Cost Price (Buy) *' : 'Unit Cost Price (Buy) *'}
              </label>
              <input
                type="number"
                name="costPrice"
                value={fullForm.costPrice}
                onChange={handleFullChange}
                required
                step="0.01"
                className="input-field mt-1"
                placeholder="₹0.00"
              />
              {fullForm.pricingType === 'TOTAL_BULK' && fullForm.initialStock > 0 && fullForm.costPrice && (
                <p className="text-xs text-gray-500 mt-1">Per unit cost: ₹{(parseFloat(fullForm.costPrice) / parseFloat(fullForm.initialStock)).toFixed(2)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {fullForm.pricingType === 'TOTAL_BULK' ? 'Total Selling Price' : 'Unit Selling Price'}
              </label>
              <input
                type="number"
                name="price"
                value={fullForm.price}
                onChange={handleFullChange}
                step="0.01"
                className="input-field mt-1"
                placeholder="₹0.00"
              />
              {fullForm.pricingType === 'TOTAL_BULK' && fullForm.initialStock > 0 && fullForm.price && (
                <p className="text-xs text-gray-500 mt-1">Per unit price: ₹{(parseFloat(fullForm.price) / parseFloat(fullForm.initialStock)).toFixed(2)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <select
                name="supplierId"
                value={fullForm.supplierId}
                onChange={handleFullChange}
                className="input-field mt-1"
              >
                <option value="">Select Supplier</option>
                {suppliers && suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Code</label>
              <input
                type="text"
                name="productCode"
                value={fullForm.productCode}
                onChange={handleFullChange}
                className="input-field mt-1"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (mode === 'quick' && !quickFormValid())}
            className="btn-primary px-6 py-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              isEditMode ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
