import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CalendarDaysIcon, PlusIcon, ClockIcon, CheckCircleIcon, TruckIcon,
    XCircleIcon, PhoneIcon, CakeIcon, SparklesIcon, GiftIcon,
} from '@heroicons/react/24/outline';
import {
    fetchBookings, fetchBookingStats, fetchUpcoming, fetchCatalog,
    createBooking, updateBooking, clearBookingSuccess, clearBookingError,
} from './bookingSlice';

const API_URL = 'http://localhost:8080';

const EVENT_ICONS = { BIRTHDAY: '🎂', WEDDING: '💒', RECEPTION: '🎉', ANNIVERSARY: '💝', CORPORATE: '🏢', FESTIVAL: '🪔', OTHER: '📋' };
const STATUS_STYLES = {
    PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
    IN_PROGRESS: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
    READY: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-400' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' },
};

const formatCurrency = (a) => '₹' + Number(a || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BookingDashboard = () => {
    const dispatch = useDispatch();
    const { bookings, stats, upcoming, catalog, loading, success, error } = useSelector(s => s.bookings);
    const [activeView, setActiveView] = useState('dashboard');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showNewBooking, setShowNewBooking] = useState(false);
    const [editBooking, setEditBooking] = useState(null);
    const [form, setForm] = useState(getEmptyForm());
    const [searchTerm, setSearchTerm] = useState('');

    function getEmptyForm() {
        return {
            customerName: '', customerMobile: '', customerEmail: '', eventType: 'BIRTHDAY',
            cakeDescription: '', flavor: '', weightKg: '1', tierCount: '1', messageOnCake: '',
            deliveryDate: '', deliveryTime: '', deliveryAddress: '', designNotes: '',
            estimatedPrice: '', depositPercentage: '50', depositPaid: false,
            paymentMethod: 'CASH', catalogItemId: '', isCustom: true, notes: '',
        };
    }

    useEffect(() => {
        dispatch(fetchBookingStats());
        dispatch(fetchBookings());
        dispatch(fetchUpcoming());
        dispatch(fetchCatalog());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setShowNewBooking(false);
            setEditBooking(null);
            setForm(getEmptyForm());
            dispatch(clearBookingSuccess());
            dispatch(fetchBookingStats());
            dispatch(fetchBookings());
            dispatch(fetchUpcoming());
        }
    }, [success, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...form,
            weightKg: parseFloat(form.weightKg) || 1,
            tierCount: parseInt(form.tierCount) || 1,
            estimatedPrice: parseFloat(form.estimatedPrice) || 0,
            depositPercentage: parseInt(form.depositPercentage) || 50,
            catalogItemId: form.catalogItemId ? parseInt(form.catalogItemId) : null,
        };
        if (editBooking) {
            dispatch(updateBooking({ id: editBooking.id, data }));
        } else {
            dispatch(createBooking(data));
        }
    };

    const handleStatusChange = (booking, newStatus) => {
        dispatch(updateBooking({ id: booking.id, data: { status: newStatus } }));
    };

    const handleEdit = (booking) => {
        setForm({
            customerName: booking.customerName || '', customerMobile: booking.customerMobile || '',
            customerEmail: booking.customerEmail || '', eventType: booking.eventType || 'BIRTHDAY',
            cakeDescription: booking.cakeDescription || '', flavor: booking.flavor || '',
            weightKg: String(booking.weightKg || 1), tierCount: String(booking.tierCount || 1),
            messageOnCake: booking.messageOnCake || '',
            deliveryDate: booking.deliveryDate || '', deliveryTime: booking.deliveryTime || '',
            deliveryAddress: booking.deliveryAddress || '', designNotes: booking.designNotes || '',
            estimatedPrice: String(booking.estimatedPrice || ''), depositPercentage: String(booking.depositPercentage || 50),
            depositPaid: booking.depositPaid || false, paymentMethod: booking.paymentMethod || 'CASH',
            catalogItemId: String(booking.catalogItemId || ''), isCustom: booking.isCustom || false,
            notes: booking.notes || '',
        });
        setEditBooking(booking);
        setShowNewBooking(true);
    };

    const selectCatalogItem = (item) => {
        setForm({
            ...form,
            cakeDescription: item.name + (item.description ? ' - ' + item.description : ''),
            estimatedPrice: String(item.basePrice || ''),
            catalogItemId: String(item.id),
            isCustom: false,
            flavor: item.flavors ? item.flavors.split(',')[0]?.trim() : '',
        });
    };

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const matchesSearch = !searchTerm || b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.customerMobile?.includes(searchTerm) || b.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statCards = [
        { label: 'Pending', value: stats?.pending || 0, icon: ClockIcon, color: 'from-amber-400 to-amber-500' },
        { label: 'In Progress', value: stats?.inProgress || 0, icon: SparklesIcon, color: 'from-purple-400 to-purple-500' },
        { label: 'Ready', value: stats?.ready || 0, icon: CheckCircleIcon, color: 'from-emerald-400 to-emerald-500' },
        { label: 'Today', value: stats?.todayDeliveries || 0, icon: TruckIcon, color: 'from-blue-400 to-blue-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
                        🎂 Advance Booking
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage cake orders for special occasions</p>
                </div>
                <button onClick={() => { setForm(getEmptyForm()); setEditBooking(null); setShowNewBooking(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    <PlusIcon className="h-5 w-5" /><span>New Booking</span>
                </button>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 text-white shadow-md`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-white/80 font-medium">{s.label}</p>
                                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                                </div>
                                <Icon className="h-8 w-8 text-white/40" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Views Toggle */}
            <div className="flex gap-2">
                {[{ id: 'dashboard', label: '📋 Orders' }, { id: 'upcoming', label: '🚚 Upcoming' }, { id: 'catalog', label: '🎂 Catalog' }].map(v => (
                    <button key={v.id} onClick={() => setActiveView(v.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === v.id ? 'bg-[#8B4513] text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'
                            }`}>{v.label}</button>
                ))}
            </div>

            {/* ==================== ORDERS VIEW ==================== */}
            {activeView === 'dashboard' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 w-60" />
                        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === s ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>{s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}</button>
                        ))}
                    </div>

                    {/* Booking Cards */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#8B4513] border-t-transparent"></div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border">
                            <p className="text-4xl mb-3">🎂</p>
                            <p className="text-gray-400 font-medium">No bookings found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredBookings.map(booking => {
                                const sty = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                                return (
                                    <div key={booking.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
                                        <div className={`h-1.5 ${sty.dot}`}></div>
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{EVENT_ICONS[booking.eventType] || '📋'}</span>
                                                        <h3 className="font-bold text-gray-800">{booking.customerName}</h3>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">{booking.bookingNumber}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${sty.bg} ${sty.text}`}>
                                                    {booking.status?.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <PhoneIcon className="h-3.5 w-3.5" />{booking.customerMobile}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <CalendarDaysIcon className="h-3.5 w-3.5" />{booking.deliveryDate || 'TBD'}
                                                </div>
                                                {booking.flavor && <div className="text-gray-500">🍰 {booking.flavor}</div>}
                                                <div className="text-gray-500">⚖️ {booking.weightKg}kg • {booking.tierCount} tier</div>
                                            </div>

                                            {booking.cakeDescription && (
                                                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{booking.cakeDescription}</p>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div>
                                                    <span className="text-lg font-bold text-[#8B4513]">{formatCurrency(booking.estimatedPrice)}</span>
                                                    <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${booking.depositPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {booking.depositPaid ? `${booking.depositPercentage}% Paid` : 'Deposit Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleEdit(booking)} className="p-1.5 text-gray-400 hover:text-[#8B4513] hover:bg-[#FDF5E6] rounded-lg">✏️</button>
                                                    {booking.status === 'PENDING' && (
                                                        <button onClick={() => handleStatusChange(booking, 'CONFIRMED')} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Confirm">✅</button>
                                                    )}
                                                    {booking.status === 'CONFIRMED' && (
                                                        <button onClick={() => handleStatusChange(booking, 'IN_PROGRESS')} className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Start">🔨</button>
                                                    )}
                                                    {booking.status === 'IN_PROGRESS' && (
                                                        <button onClick={() => handleStatusChange(booking, 'READY')} className="p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Ready">✅</button>
                                                    )}
                                                    {booking.status === 'READY' && (
                                                        <button onClick={() => handleStatusChange(booking, 'DELIVERED')} className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Deliver">🚚</button>
                                                    )}
                                                    {booking.status !== 'DELIVERED' && booking.status !== 'CANCELLED' && (
                                                        <button onClick={() => handleStatusChange(booking, 'CANCELLED')} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Cancel">❌</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== UPCOMING VIEW ==================== */}
            {activeView === 'upcoming' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">🚚 Upcoming Deliveries (Next 3 Days)</h2>
                    {upcoming.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border">
                            <p className="text-4xl mb-2">🎉</p>
                            <p className="text-gray-400">No upcoming deliveries</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map(b => (
                                <div key={b.id} className="bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{EVENT_ICONS[b.eventType] || '🎂'}</div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">{b.customerName}</h3>
                                            <p className="text-xs text-gray-500">{b.bookingNumber} • {b.flavor} • {b.weightKg}kg</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#8B4513]">{b.deliveryDate}</p>
                                        <p className="text-xs text-gray-400">{b.deliveryTime || 'Time TBD'}</p>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status]?.bg} ${STATUS_STYLES[b.status]?.text}`}>
                                            {b.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== CATALOG VIEW ==================== */}
            {activeView === 'catalog' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">🎂 Cake Catalog</h2>
                        <span className="text-sm text-gray-400">{catalog.length} items</span>
                    </div>
                    {catalog.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border">
                            <p className="text-4xl mb-3">🎂</p>
                            <p className="text-gray-400 font-medium">No catalog items yet</p>
                            <p className="text-xs text-gray-300 mt-1">Go to Catalog Management to add designs</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catalog.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                    <div className="h-40 bg-gradient-to-br from-[#FDF5E6] to-[#FAEBD7] flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl.startsWith('/') ? API_URL + item.imageUrl : item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-6xl">🎂</span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                <span className="text-[10px] bg-[#FDF5E6] text-[#8B4513] px-2 py-0.5 rounded-full font-semibold">{item.category}</span>
                                            </div>
                                            <span className="text-lg font-bold text-[#8B4513]">{formatCurrency(item.basePrice)}</span>
                                        </div>
                                        {item.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>}
                                        {item.flavors && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.flavors.split(',').slice(0, 4).map((f, i) => (
                                                    <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                        <button onClick={() => { selectCatalogItem(item); setShowNewBooking(true); }}
                                            className="w-full mt-3 py-2 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all">
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ==================== NEW/EDIT BOOKING MODAL ==================== */}
            {showNewBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-[#8B4513] to-[#D2691E] p-5 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">{editBooking ? '✏️ Edit Booking' : '🎂 New Advance Booking'}</h3>
                                <button onClick={() => { setShowNewBooking(false); setEditBooking(null); }} className="text-white/60 hover:text-white">
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Customer */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">👤 Customer Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="text" placeholder="Customer Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="tel" placeholder="Mobile Number *" value={form.customerMobile} onChange={e => setForm({ ...form, customerMobile: e.target.value })} required
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="email" placeholder="Email (Optional)" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20">
                                        {Object.entries(EVENT_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Cake Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🎂 Cake Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <textarea placeholder="Cake Description" value={form.cakeDescription} onChange={e => setForm({ ...form, cakeDescription: e.target.value })} rows="2"
                                        className="sm:col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="text" placeholder="Flavor (e.g., Chocolate)" value={form.flavor} onChange={e => setForm({ ...form, flavor: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="text" placeholder="Message on Cake" value={form.messageOnCake} onChange={e => setForm({ ...form, messageOnCake: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-400 font-medium">Weight (kg)</label>
                                            <input type="number" step="0.5" min="0.5" value={form.weightKg} onChange={e => setForm({ ...form, weightKg: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-400 font-medium">Tiers</label>
                                            <input type="number" min="1" max="5" value={form.tierCount} onChange={e => setForm({ ...form, tierCount: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                        </div>
                                    </div>
                                    <textarea placeholder="Design Notes (style, colors, theme...)" value={form.designNotes} onChange={e => setForm({ ...form, designNotes: e.target.value })} rows="2"
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                </div>
                            </div>

                            {/* Delivery */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🚚 Delivery</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="time" value={form.deliveryTime} onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                    <input type="text" placeholder="Delivery Address" value={form.deliveryAddress} onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                                        className="sm:col-span-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />
                                </div>
                            </div>

                            {/* Pricing */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">💰 Pricing & Payment</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-medium">Estimated Price (₹)</label>
                                        <input type="number" step="0.01" value={form.estimatedPrice} onChange={e => setForm({ ...form, estimatedPrice: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-medium">Deposit %</label>
                                        <div className="flex gap-2 mt-1">
                                            {[30, 50, 60, 100].map(p => (
                                                <button key={p} type="button" onClick={() => setForm({ ...form, depositPercentage: String(p) })}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${form.depositPercentage === String(p) ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}>{p}%</button>
                                            ))}
                                        </div>
                                    </div>
                                    <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                                        className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                                        <option value="CASH">💵 Cash</option><option value="CARD">💳 Card</option>
                                        <option value="UPI">📱 UPI</option><option value="BANK_TRANSFER">🏦 Bank</option>
                                    </select>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.depositPaid} onChange={e => setForm({ ...form, depositPaid: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]" />
                                        <span className="text-sm text-gray-600">Deposit Received</span>
                                    </label>
                                </div>
                                {form.estimatedPrice && form.depositPercentage && (
                                    <div className="mt-3 p-3 bg-[#FDF5E6] rounded-xl text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Deposit ({form.depositPercentage}%)</span>
                                            <span className="font-semibold">{formatCurrency((parseFloat(form.estimatedPrice) * parseInt(form.depositPercentage) / 100))}</span></div>
                                        <div className="flex justify-between mt-1"><span className="text-gray-500">Remaining</span>
                                            <span className="font-bold text-[#8B4513]">{formatCurrency((parseFloat(form.estimatedPrice) * (100 - parseInt(form.depositPercentage)) / 100))}</span></div>
                                    </div>
                                )}
                            </div>

                            <textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows="2"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20" />

                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setShowNewBooking(false); setEditBooking(null); }}
                                    className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50">
                                    {loading ? 'Saving...' : editBooking ? 'Update Booking' : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDashboard;
