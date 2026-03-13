import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { fetchEmployees, createEmployee, toggleEmployeeStatus, deleteEmployee } from './authSlice';

const EmployeeManagement = () => {
  const dispatch = useDispatch();
  const { employees, loading, error, success, user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'EMPLOYEE',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(fetchEmployees());
      setShowAddModal(false);
      setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', address: '', role: 'EMPLOYEE' });
      setSubmitError('');
      setValidationErrors({});
    }
  }, [success, dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) errors.phone = 'Phone must be 10-15 digits';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await dispatch(createEmployee({
        fullName: formData.fullName, email: formData.email, phone: formData.phone,
        password: formData.password, address: formData.address, role: formData.role,
      })).unwrap();
    } catch (err) {
      if (err.fieldErrors) setValidationErrors(err.fieldErrors);
      setSubmitError(err.message || 'Failed to create employee');
    }
  };

  const handleToggleStatus = (id) => {
    if (window.confirm('Change this employee\'s status?')) dispatch(toggleEmployeeStatus(id));
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this employee? This cannot be undone.')) dispatch(deleteEmployee(id));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', light: 'bg-purple-50' };
      case 'MANAGER': return { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', light: 'bg-blue-50' };
      default: return { bg: 'bg-[#8B4513]', text: 'text-[#8B4513]', badge: 'bg-[#FDF5E6] text-[#8B4513]', light: 'bg-[#FDF5E6]' };
    }
  };

  const filteredEmployees = (employees || []).filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm);
    const matchesRole = filterRole === 'ALL' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: employees?.length || 0,
    active: employees?.filter(e => e.isActive).length || 0,
    inactive: employees?.filter(e => !e.isActive).length || 0,
    managers: employees?.filter(e => e.role === 'MANAGER').length || 0,
  };

  const renderField = (Icon, label, name, type = 'text', required = false, placeholder = '', props = {}) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            rows="2"
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all ${validationErrors[name] ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
            {...props}
          />
        ) : (
          <input
            type={name === 'password' || name === 'confirmPassword' ? (showPassword ? 'text' : 'password') : type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition-all ${validationErrors[name] ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
            {...props}
          />
        )}
        {(name === 'password') && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
      {validationErrors[name] && <p className="mt-1 text-xs text-red-500">{validationErrors[name]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your bakery team members</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] self-start"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Member</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: stats.total, color: 'text-gray-800', bg: 'bg-white' },
          { label: 'Active', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', value: stats.inactive, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Managers', value: stats.managers, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100 shadow-sm`}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513]"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'EMPLOYEE', 'MANAGER', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${filterRole === role ? 'bg-[#8B4513] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {role === 'ALL' ? 'All' : role.charAt(0) + role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#8B4513] border-t-transparent"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <UserIcon className="h-16 w-16 text-gray-200 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-400">No members found</p>
          <p className="text-sm text-gray-300">Try a different search or add a new member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => {
            const roleStyle = getRoleColor(employee.role);
            return (
              <div key={employee.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                {/* Card header with role color */}
                <div className={`h-1.5 ${roleStyle.bg}`}></div>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl ${roleStyle.bg} text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}>
                      {getInitials(employee.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 truncate">{employee.fullName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${roleStyle.badge}`}>
                          <ShieldCheckIcon className="h-3 w-3" />
                          {employee.role || 'EMPLOYEE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span className={`text-xs font-medium ${employee.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <PhoneIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span>{employee.phone}</span>
                    </div>
                    {employee.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPinIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{employee.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                      Joined {new Date(employee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleStatus(employee.id)}
                        title={employee.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${employee.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      >
                        {employee.isActive ? <XCircleIcon className="h-4.5 w-4.5" /> : <CheckCircleIcon className="h-4.5 w-4.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-[fadeInUp_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Add New Member</h3>
                  <p className="text-white/70 text-xs mt-0.5">Fill in the details to create a new account</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white p-1">
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {renderField(UserIcon, 'Full Name', 'fullName', 'text', true, 'Enter full name')}
              {renderField(EnvelopeIcon, 'Email', 'email', 'email', true, 'email@example.com')}
              {renderField(PhoneIcon, 'Phone', 'phone', 'tel', true, '10-digit mobile number')}
              {renderField(MapPinIcon, 'Address', 'address', 'textarea', false, 'Enter address (optional)')}

              {/* Role Selector */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'EMPLOYEE', label: 'Employee', desc: 'Sales & stock updates', icon: '👤' },
                      { value: 'MANAGER', label: 'Manager', desc: 'Full management access', icon: '👔' },
                    ].map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${formData.role === role.value
                          ? 'border-[#8B4513] bg-[#FDF5E6] shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <span className="text-xl">{role.icon}</span>
                        <p className="font-semibold text-sm mt-1">{role.label}</p>
                        <p className="text-[10px] text-gray-400">{role.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {renderField(null, 'Password', 'password', 'password', true, 'Min 6 characters')}
                {renderField(null, 'Confirm Password', 'confirmPassword', 'password', true, 'Re-enter password')}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </div>
                  ) : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeManagement;
