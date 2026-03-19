import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, PencilIcon, TrashIcon, XCircleIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { fetchCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem, uploadCatalogImage, clearBookingSuccess } from './bookingSlice';

const CATEGORIES = ['BIRTHDAY', 'WEDDING', 'ANNIVERSARY', 'PHOTO', 'DESIGNER', 'THEME', 'FESTIVAL', 'EGGLESS', 'CUSTOM'];
const CAT_ICONS = { BIRTHDAY: '🎂', WEDDING: '💒', ANNIVERSARY: '💝', PHOTO: '📸', DESIGNER: '🎨', THEME: '🎭', FESTIVAL: '🪔', EGGLESS: '🥚', CUSTOM: '✨' };
const API_URL = 'http://localhost:8080';

const formatCurrency = (a) => '₹' + Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CatalogManagement = () => {
    const dispatch = useDispatch();
    const { catalog, loading, success } = useSelector(s => s.bookings);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterCat, setFilterCat] = useState('ALL');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: '', description: '', category: 'BIRTHDAY', basePrice: '', pricePerKg: '',
        flavors: '', availableWeights: '0.5, 1, 1.5, 2, 3', availableTiers: '1, 2, 3', minOrderHours: '24',
    });

    useEffect(() => { dispatch(fetchCatalog()); }, [dispatch]);
    useEffect(() => {
        if (success) {
            setShowModal(false); setEditItem(null); resetForm();
            dispatch(clearBookingSuccess()); dispatch(fetchCatalog());
        }
    }, [success, dispatch]);

    const resetForm = () => {
        setForm({
            name: '', description: '', category: 'BIRTHDAY', basePrice: '', pricePerKg: '',
            flavors: '', availableWeights: '0.5, 1, 1.5, 2, 3', availableTiers: '1, 2, 3', minOrderHours: '24',
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleEdit = (item) => {
        setForm({
            name: item.name || '', description: item.description || '', category: item.category || 'BIRTHDAY',
            basePrice: String(item.basePrice || ''), pricePerKg: String(item.pricePerKg || ''),
            flavors: item.flavors || '',
            availableWeights: item.availableWeights || '', availableTiers: item.availableTiers || '',
            minOrderHours: String(item.minOrderHours || 24),
        });
        setImageFile(null);
        setImagePreview(item.imageUrl ? (item.imageUrl.startsWith('/') ? API_URL + item.imageUrl : item.imageUrl) : null);
        setEditItem(item);
        setShowModal(true);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const data = { ...form, basePrice: parseFloat(form.basePrice) || 0, pricePerKg: parseFloat(form.pricePerKg) || 0, minOrderHours: parseInt(form.minOrderHours) || 24 };

            let resultItem;
            if (editItem) {
                resultItem = await dispatch(updateCatalogItem({ id: editItem.id, data })).unwrap();
            } else {
                resultItem = await dispatch(createCatalogItem(data)).unwrap();
            }

            // Upload image if a new file was selected
            if (imageFile && resultItem?.id) {
                await dispatch(uploadCatalogImage({ id: resultItem.id, file: imageFile })).unwrap();
            }

            dispatch(fetchCatalog());
        } catch (err) {
            console.error('Failed to save catalog item', err);
        }
        setUploading(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this catalog item?')) dispatch(deleteCatalogItem(id));
    };

    const getImageSrc = (item) => {
        if (!item.imageUrl) return null;
        return item.imageUrl.startsWith('/') ? API_URL + item.imageUrl : item.imageUrl;
    };

    const filtered = filterCat === 'ALL' ? catalog : catalog.filter(c => c.category === filterCat);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">Cake Catalog</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your cake designs and offerings</p>
                </div>
                <button onClick={() => { resetForm(); setEditItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    <PlusIcon className="h-5 w-5" /><span>Add Design</span>
                </button>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterCat('ALL')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCat === 'ALL' ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-600'}`}>
                    All ({catalog.length})
                </button>
                {CATEGORIES.map(cat => {
                    const count = catalog.filter(c => c.category === cat).length;
                    if (count === 0) return null;
                    return (
                        <button key={cat} onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterCat === cat ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {CAT_ICONS[cat]} {cat} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Catalog Grid */}
            {loading && catalog.length === 0 ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-3 border-[#8B4513] border-t-transparent"></div></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border"><p className="text-4xl mb-3">🎂</p><p className="text-gray-400">No catalog items</p></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="h-36 bg-gradient-to-br from-[#FDF5E6] to-[#FAEBD7] relative overflow-hidden">
                                {getImageSrc(item) ? (
                                    <img src={getImageSrc(item)} alt={item.name} className="w-full h-full object-cover object-center" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><span className="text-5xl">{CAT_ICONS[item.category] || '🎂'}</span></div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(item)} className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white"><PencilIcon className="h-4 w-4 text-[#8B4513]" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white/90 rounded-lg shadow-sm hover:bg-white"><TrashIcon className="h-4 w-4 text-red-500" /></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                                        <span className="text-[10px] bg-[#FDF5E6] text-[#8B4513] px-2 py-0.5 rounded-full font-semibold">{item.category}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#8B4513]">{formatCurrency(item.basePrice)}</span>
                                </div>
                                {item.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>}
                                {item.flavors && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.flavors.split(',').slice(0, 3).map((f, i) => (
                                            <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{f.trim()}</span>
                                        ))}
                                        {item.flavors.split(',').length > 3 && <span className="text-[10px] text-gray-400">+{item.flavors.split(',').length - 3}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] p-5 rounded-t-2xl flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">{editItem ? '✏️ Edit Design' : '🎂 New Cake Design'}</h3>
                            <button onClick={() => { setShowModal(false); setEditItem(null); resetForm(); }} className="text-white/60 hover:text-white"><XCircleIcon className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Cake Image</label>
                                <div className="mt-1.5">
                                    {imagePreview ? (
                                        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#8B4513]/30 bg-[#FDF5E6]">
                                            <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group">
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white rounded-lg text-sm font-semibold text-[#8B4513] shadow-lg transition-all">
                                                    📷 Change Image
                                                </button>
                                            </div>
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md">
                                                <XCircleIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#8B4513] hover:bg-[#FDF5E6] transition-all cursor-pointer group">
                                            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-[#FDF5E6] transition-all">
                                                <PhotoIcon className="h-8 w-8 text-gray-400 group-hover:text-[#8B4513]" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-gray-500 group-hover:text-[#8B4513]">Click to upload image</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, GIF — Max 5MB</p>
                                            </div>
                                        </button>
                                    )}
                                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" onChange={handleImageSelect} className="hidden" />
                                </div>
                            </div>

                            <input type="text" placeholder="Cake Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="2"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />

                            <div>
                                <label className="text-[10px] text-gray-400 font-medium uppercase">Category</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    {CATEGORIES.map(cat => (
                                        <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                                            className={`py-2 rounded-lg text-xs font-semibold transition-all ${form.category === cat ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {CAT_ICONS[cat]} {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-medium">Base Price (₹)</label>
                                    <input type="number" step="0.01" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-medium">Price Per Kg (₹)</label>
                                    <input type="number" step="0.01" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                </div>
                            </div>

                            <input type="text" placeholder="Flavors (comma separated: Chocolate, Vanilla, Strawberry...)" value={form.flavors} onChange={e => setForm({ ...form, flavors: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Weights (0.5, 1, 2...)" value={form.availableWeights} onChange={e => setForm({ ...form, availableWeights: e.target.value })}
                                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                <input type="text" placeholder="Tiers (1, 2, 3)" value={form.availableTiers} onChange={e => setForm({ ...form, availableTiers: e.target.value })}
                                    className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setEditItem(null); resetForm(); }}
                                    className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={loading || uploading}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {(loading || uploading) ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Saving...</>
                                    ) : editItem ? 'Update' : 'Add Design'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogManagement;
