import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    ClipboardDocumentListIcon,
    FunnelIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '../config/api';

const TransactionHistory = () => {
    const { token } = useSelector((state) => state.auth);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

  
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/inventory/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    const getDateRangeStart = () => {
        const now = new Date();
        switch (dateRange) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                return weekStart;
            case 'month':
                const monthStart = new Date(now);
                monthStart.setMonth(now.getMonth() - 1);
                return monthStart;
            default:
                return null;
        }
    };

    const filteredTransactions = transactions.filter((t) => {
        if (filter !== 'all' && t.transactionType !== filter) return false;
        const rangeStart = getDateRangeStart();
        if (rangeStart) {
            const txDate = new Date(t.transactionDate);
            if (txDate < rangeStart) return false;
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            return (
                (t.productName && t.productName.toLowerCase().includes(term)) ||
                (t.userName && t.userName.toLowerCase().includes(term)) ||
                (t.referenceNumber && t.referenceNumber.toLowerCase().includes(term)) ||
                (t.reason && t.reason.toLowerCase().includes(term))
            );
        }
        return true;
    });

    // Sort by date
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.createdAt);
        const dateB = new Date(b.transactionDate || b.createdAt);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const getTypeColor = (type) => {
        switch (type) {
            case 'STOCK_IN': return 'bg-green-100 text-green-800';
            case 'STOCK_OUT': return 'bg-red-100 text-red-800';
            case 'ADJUSTMENT': return 'bg-blue-100 text-blue-800';
            case 'RETURN': return 'bg-yellow-100 text-yellow-800';
            case 'WASTAGE': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'STOCK_IN': return '📦 Stock In';
            case 'STOCK_OUT': return '📤 Stock Out';
            case 'ADJUSTMENT': return '🔧 Adjustment';
            case 'RETURN': return '↩️ Return';
            case 'WASTAGE': return '🗑️ Wastage';
            default: return type;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const summaryStats = {
        totalIn: sortedTransactions.filter(t => t.transactionType === 'STOCK_IN').reduce((s, t) => s + Math.abs(t.quantity), 0),
        totalOut: sortedTransactions.filter(t => t.transactionType === 'STOCK_OUT').reduce((s, t) => s + Math.abs(t.quantity), 0),
        totalWaste: sortedTransactions.filter(t => t.transactionType === 'WASTAGE').reduce((s, t) => s + Math.abs(t.quantity), 0),
        totalTx: sortedTransactions.length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#8B4513]">Transaction Log</h1>
                    <p className="text-sm text-gray-500">Track all inventory movements</p>
                </div>
                <button onClick={fetchTransactions} className="btn-secondary flex items-center space-x-2">
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card bg-green-50 border-l-4 border-green-500">
                    <p className="text-xs text-green-600 font-medium">Total Stock In</p>
                    <p className="text-2xl font-bold text-green-700">{summaryStats.totalIn}</p>
                </div>
                <div className="card bg-red-50 border-l-4 border-red-500">
                    <p className="text-xs text-red-600 font-medium">Total Stock Out</p>
                    <p className="text-2xl font-bold text-red-700">{summaryStats.totalOut}</p>
                </div>
                <div className="card bg-orange-50 border-l-4 border-orange-500">
                    <p className="text-xs text-orange-600 font-medium">Total Wastage</p>
                    <p className="text-2xl font-bold text-orange-700">{summaryStats.totalWaste}</p>
                </div>
                <div className="card bg-blue-50 border-l-4 border-blue-500">
                    <p className="text-xs text-blue-600 font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-700">{summaryStats.totalTx}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Period:</span>
                        {['today', 'week', 'month', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${dateRange === range
                                    ? 'bg-[#8B4513] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Type:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                        >
                            <option value="all">All Types</option>
                            <option value="STOCK_IN">Stock In</option>
                            <option value="STOCK_OUT">Stock Out</option>
                            <option value="ADJUSTMENT">Adjustment</option>
                            <option value="RETURN">Return</option>
                            <option value="WASTAGE">Wastage</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by product, user, reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                        />
                    </div>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap"
                    >
                        {sortOrder === 'newest' ? '⬇️ Newest First' : '⬆️ Oldest First'}
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                <div className="text-sm text-gray-500 mb-3">
                    Showing {sortedTransactions.length} transactions
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Change</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before → After</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
                                    </td>
                                </tr>
                            ) : sortedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                        No transactions found for the selected filters
                                    </td>
                                </tr>
                            ) : (
                                sortedTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{formatDate(tx.transactionDate)}</div>
                                            <div className="text-xs text-gray-500">{formatTime(tx.transactionDate)}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{tx.productName}</div>
                                            <div className="text-xs text-gray-400">{tx.productCode || ''}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(tx.transactionType)}`}>
                                                {getTypeLabel(tx.transactionType)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {tx.previousQuantity} → {tx.newQuantity}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {tx.userName || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {tx.referenceNumber || tx.reason || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                                            {tx.notes || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
