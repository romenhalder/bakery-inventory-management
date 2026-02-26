import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BellIcon,
  UserCircleIcon,
  CurrencyRupeeIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../features/auth/authSlice';
import { fetchUnreadAlerts } from '../features/alerts/alertSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { unreadAlerts } = useSelector((state) => state.alerts);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  useEffect(() => {
    dispatch(fetchUnreadAlerts());
    const interval = setInterval(() => dispatch(fetchUnreadAlerts()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setShowProfileMenu(false);
  };

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Admin', bg: 'bg-green-500' };
    if (isManager) return { text: 'Manager', bg: 'bg-purple-500' };
    return { text: 'Employee', bg: 'bg-blue-400' };
  };

  const roleBadge = getRoleBadge();

  const dashboardPath = isAdminOrManager ? '/dashboard' : '/employee-dashboard';

  return (
    <nav className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            >
              <span className="text-2xl">🥐</span>
              <span className="text-xl font-bold hidden sm:block">Bakery Inventra</span>
            </button>

            {/* Quick Nav Links */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => navigate(dashboardPath)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${location.pathname === dashboardPath || location.pathname === '/'
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                  }`}
              >
                <HomeIcon className="h-4 w-4 inline mr-1" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/sell')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${location.pathname === '/sell' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
              >
                <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
                POS
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Alerts */}
            <button
              onClick={() => navigate('/alerts')}
              className="relative p-2 rounded-full hover:bg-white/15 transition-colors"
            >
              <BellIcon className="h-6 w-6" />
              {unreadAlerts && unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${roleBadge.bg} text-white`}>
                    {roleBadge.text}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded ${roleBadge.bg} text-white`}>
                      {roleBadge.text}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
