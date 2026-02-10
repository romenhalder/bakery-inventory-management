import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, fetchProductById, clearSuccess, clearError } from './productSlice';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const { currentProduct, loading, success, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productCode: '',
    categoryId: '',
    productType: 'FINISHED_GOOD',
    unitOfMeasure: 'pieces',
    price: '',
    costPrice: '',
    minStockLevel: 10,
    maxStockLevel: 1000,
    reorderPoint: 20,
    expiryDays: '',
    isActive: true,
    isSellable: true,
    supplierId: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

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
      setFormData({
        name: currentProduct.name || '',
        description: currentProduct.description || '',
        productCode: currentProduct.productCode || '',
        categoryId: currentProduct.categoryId || '',
        productType: currentProduct.productType || 'FINISHED_GOOD',
        unitOfMeasure: currentProduct.unitOfMeasure || 'pieces',
        price: currentProduct.price || '',
        costPrice: currentProduct.costPrice || '',
        minStockLevel: currentProduct.minStockLevel || 10,
        maxStockLevel: currentProduct.maxStockLevel || 1000,
        reorderPoint: currentProduct.reorderPoint || 20,
        expiryDays: currentProduct.expiryDays || '',
        isActive: currentProduct.isActive !== false,
        isSellable: currentProduct.isSellable !== false,
        supplierId: currentProduct.supplierId || '',
        image: null,
      });
      if (currentProduct.imageUrl) {
        setImagePreview(`http://localhost:8080/uploads/${currentProduct.imageUrl}`);
      }
    }
  }, [isEditMode, currentProduct]);

  useEffect(() => {
    if (success) {
      navigate('/products');
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== '') {
        productData.append(key, formData[key]);
      }
    });

    if (isEditMode) {
      dispatch(updateProduct({ id, productData }));
    } else {
      dispatch(createProduct(productData));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#8B4513] mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field mt-1"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Code</label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Enter product code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <input
                type="number"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="input-field mt-1"
                placeholder="Enter category ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Product Type *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                required
                className="input-field mt-1"
              >
                <option value="FINISHED_GOOD">Finished Good</option>
                <option value="RAW_MATERIAL">Raw Material</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
              <input
                type="text"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="e.g., pieces, kg, liters"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Pricing & Stock</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="input-field mt-1"
                placeholder="Enter price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cost Price</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                className="input-field mt-1"
                placeholder="Enter cost price"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Stock</label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Stock</label>
                <input
                  type="number"
                  name="maxStockLevel"
                  value={formData.maxStockLevel}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder</label>
                <input
                  type="number"
                  name="reorderPoint"
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  className="input-field mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Days</label>
              <input
                type="number"
                name="expiryDays"
                value={formData.expiryDays}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="Days until expiry"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="input-field mt-1"
            placeholder="Enter product description"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Image</label>
          <div className="mt-1 flex items-center space-x-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
            )}
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded text-[#8B4513] focus:ring-[#8B4513]"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isSellable"
              checked={formData.isSellable}
              onChange={handleChange}
              className="rounded text-[#8B4513] focus:ring-[#8B4513]"
            />
            <span className="text-sm text-gray-700">Sellable</span>
          </label>
        </div>

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
            disabled={loading}
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
