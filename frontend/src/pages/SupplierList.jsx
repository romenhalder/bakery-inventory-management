import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '../config/api';

const SupplierList = () => {
  const { token } = useSelector((state) => state.auth);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // newest or oldest
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    licenseNumber: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState('');


  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Supplier name is required';
    if (!formData.phone.trim() && !formData.email.trim()) {
      errors.phone = 'At least phone or email is required';
      errors.email = 'At least phone or email is required';
    }
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a valid phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const method = editingSupplier ? 'PUT' : 'POST';
      const url = editingSupplier
        ? `${API_URL}/suppliers/${editingSupplier.id}`
        : `${API_URL}/suppliers`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchSuppliers();
        setSubmitSuccess(editingSupplier ? 'Supplier updated!' : 'Supplier created!');
        setTimeout(() => { setSubmitSuccess(''); closeModal(); }, 1500);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save supplier');
      }
    } catch (err) {
      alert('Failed to save supplier');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          fetchSuppliers();
        }
      } catch (err) {
        alert('Failed to delete supplier');
      }
    }
  };

  const toggleStatus = async (supplier) => {
    if (window.confirm(`Are you sure you want to ${supplier.isActive ? 'deactivate' : 'activate'} ${supplier.name}?`)) {
      try {
        const response = await fetch(`${API_URL}/suppliers/${supplier.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...supplier, isActive: !supplier.isActive }),
        });
        if (response.ok) fetchSuppliers();
      } catch (err) {
        alert('Failed to update supplier status');
      }
    }
  };

  const openModal = (supplier = null) => {
    setFormErrors({});
    setSubmitSuccess('');
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        licenseNumber: supplier.licenseNumber || '',
        isActive: supplier.isActive,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        licenseNumber: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormErrors({});
    setSubmitSuccess('');
  };

  // Filter & sort
  const filtered = suppliers
    .filter(s => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.name?.toLowerCase().includes(term) ||
        s.contactPerson?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return (b.id || 0) - (a.id || 0);
      return (a.id || 0) - (b.id || 0);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">Suppliers</h1>
          <p className="text-sm text-gray-500">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search & Sort */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="btn-secondary text-sm flex items-center gap-1 whitespace-nowrap"
          >
            {sortOrder === 'newest' ? '⬇️ Newest First' : '⬆️ Oldest First'}
          </button>
        </div>
      </div>

      {/* Supplier Cards */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No suppliers found</p>
          <button onClick={() => openModal()} className="mt-3 text-sm text-[#8B4513] hover:underline">
            Add your first supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((supplier) => (
            <div
              key={supplier.id}
              className={`card hover:shadow-lg transition-shadow border-l-4 ${supplier.isActive ? 'border-l-green-500' : 'border-l-gray-300'
                }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                  {supplier.contactPerson && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5" />
                      {supplier.contactPerson}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {supplier.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
                {supplier.licenseNumber && (
                  <div className="text-xs text-gray-400">
                    License: {supplier.licenseNumber}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => toggleStatus(supplier)}
                  className={`text-xs px-2.5 py-1 rounded ${supplier.isActive
                      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  {supplier.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openModal(supplier)}
                  className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                >
                  <PencilIcon className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                >
                  <TrashIcon className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improved Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  {editingSupplier ? '✏️ Edit Supplier' : '➕ New Supplier'}
                </h2>
                <p className="text-xs text-white/70">Fill in the supplier details below</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {submitSuccess && (
              <div className="mx-6 mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                ✅ {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier / Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`input-field mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., ABC Flour Mills Pvt. Ltd."
                />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="input-field mt-1"
                  placeholder="e.g., Rajesh Kumar"
                />
              </div>

              {/* Phone & Email - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`input-field mt-1 ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="9876543210"
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`input-field mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="supplier@mail.com"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">License / FSSAI Number</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="input-field mt-1"
                  placeholder="e.g., FSSAI12345678901234"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                  className="input-field mt-1"
                  placeholder="Full address with city, state, pin code"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="input-field mt-1"
                  placeholder="Payment terms, delivery schedule, etc."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2.5 font-medium text-sm">
                  {editingSupplier ? '💾 Update Supplier' : '➕ Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierList;
