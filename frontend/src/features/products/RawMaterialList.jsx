import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { fetchProducts, deleteProduct, searchProducts, clearSuccess } from './productSlice';

const RawMaterialList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector((state) => state.products);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER';
    const canEdit = isAdmin || isManager;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        dispatch(fetchProducts());
        return () => {
            dispatch(clearSuccess());
        };
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            dispatch(searchProducts(searchTerm));
        } else {
            dispatch(fetchProducts());
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this raw material?')) {
            dispatch(deleteProduct(id));
        }
    };

    // Filter only raw materials (explicitly by productType)
    const rawMaterials = products.filter((p) => p.productType === 'RAW_MATERIAL');

    // Apply search term filter on client side for raw materials specifically
    const filteredMaterials = rawMaterials.filter((m) =>
        searchTerm.trim() === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const sortedMaterials = [...filteredMaterials].sort((a, b) => {
        if (sortOrder === 'newest') return (b.id || 0) - (a.id || 0);
        return (a.id || 0) - (b.id || 0);
    });

    const getStockStatus = (product) => {
        if (product.currentStock === 0 || product.isOutOfStock || product.currentStock < 0) {
            return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
        } else if (product.isLowStock || product.currentStock <= product.minStockLevel) {
            return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#8B4513]">Raw Materials</h1>
                {canEdit && (
                    <button
                        onClick={() => navigate('/products/add')}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Add Raw Material</span>
                    </button>
                )}
            </div>

            <div className="card">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search raw materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <button type="submit" className="btn-secondary">
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                        className="btn-secondary whitespace-nowrap"
                    >
                        {sortOrder === 'newest' ? '⬇️ Newest' : '⬆️ Oldest'}
                    </button>
                </form>
            </div>

            <div className="text-sm text-gray-600">
                Showing {sortedMaterials.length} raw materials
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
                                    </td>
                                </tr>
                            ) : sortedMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No raw materials found</td>
                                </tr>
                            ) : (
                                sortedMaterials.map((material) => {
                                    const stockStatus = getStockStatus(material);
                                    return (
                                        <tr key={material.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{material.name}</div>
                                                <div className="text-xs text-gray-500">{material.productCode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.sku || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.supplierName || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{material.costPrice || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{material.currentStock} {material.unitOfMeasure}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.class}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => navigate(`/products/edit/${material.id}`)}
                                                        className="text-[#8B4513] hover:text-[#DAA520] mr-3"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(material.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
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

export default RawMaterialList;
