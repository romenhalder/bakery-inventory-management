import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HomeIcon,
  ShoppingBagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  KeyIcon,
  CurrencyRupeeIcon,
  TagIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  const [openGroups, setOpenGroups] = useState({ products: true, management: true });

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Manager gets admin dashboard + all admin features except Employees & Password Requests
  const dashboardLink = isAdminOrManager
    ? { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' }
    : { to: '/employee-dashboard', icon: HomeIcon, label: 'Dashboard' };

  const sellLink = { to: '/sell', icon: CurrencyRupeeIcon, label: 'Sell Product' };

  const productGroup = {
    label: 'Products',
    icon: ShoppingBagIcon,
    links: [
      { to: '/products', icon: ShoppingBagIcon, label: 'Finished Goods' },
      { to: '/raw-materials', icon: CubeIcon, label: 'Raw Materials' },
      ...(isAdminOrManager ? [
        { to: '/categories', icon: TagIcon, label: 'Categories' },
        { to: '/suppliers', icon: TruckIcon, label: 'Suppliers' },
      ] : []),
    ],
  };

  const inventoryLinks = [
    { to: '/inventory', icon: ArchiveBoxIcon, label: 'Inventory' },
    { to: '/alerts', icon: ExclamationTriangleIcon, label: 'Alerts' },
  ];

  const managementGroup = isAdminOrManager ? {
    label: 'Management',
    icon: ChartBarIcon,
    links: [
      ...(isAdminOrManager ? [{ to: '/transactions', icon: ClipboardDocumentListIcon, label: 'Transaction Log' }] : []),
      ...(isAdminOrManager ? [{ to: '/reports', icon: ChartBarIcon, label: 'Reports' }] : []),
      ...(isAdmin ? [
        { to: '/employees', icon: UsersIcon, label: 'Employees' },
        { to: '/password-reset-requests', icon: KeyIcon, label: 'Password Requests' },
      ] : []),
    ],
  } : null;

  const renderLink = (link) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.to ||
      (link.to !== '/' && link.to !== '/dashboard' && link.to !== '/employee-dashboard' && location.pathname.startsWith(link.to));

    return (
      <NavLink
        key={link.to}
        to={link.to}
        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[#8B4513] text-white shadow-md'
            : 'text-gray-700 hover:bg-[#FDF5E6] hover:text-[#8B4513]'
        }`}
      >
        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span>{link.label}</span>
      </NavLink>
    );
  };

  const renderGroup = (group, groupKey) => {
    if (!group) return null;
    const isOpen = openGroups[groupKey] !== false;
    const GroupIcon = group.icon;
    const hasActiveChild = group.links.some(
      (link) => location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to))
    );

    return (
      <div key={groupKey} className="space-y-1">
        <button
          onClick={() => toggleGroup(groupKey)}
          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasActiveChild ? 'bg-[#FDF5E6] text-[#8B4513]' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center">
            <GroupIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>{group.label}</span>
          </div>
          {isOpen ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l-2 border-[#DAA520]/30 pl-2">
            {group.links.map(renderLink)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)] flex flex-col">
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {renderLink(dashboardLink)}
        {renderLink(sellLink)}

        <div className="pt-2 pb-1">
          <div className="border-t border-gray-200"></div>
        </div>

        {renderGroup(productGroup, 'products')}

        <div className="pt-2 pb-1">
          <div className="border-t border-gray-200"></div>
        </div>

        {inventoryLinks.map(renderLink)}

        {managementGroup && (
          <>
            <div className="pt-2 pb-1">
              <div className="border-t border-gray-200"></div>
            </div>
            {renderGroup(managementGroup, 'management')}
          </>
        )}
      </nav>

      <div className="w-64 p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${
            isAdmin ? 'bg-green-500' : isManager ? 'bg-purple-500' : 'bg-blue-500'
          }`} />
          <span className="text-gray-600 font-medium">
            {isAdmin ? 'Administrator' : isManager ? 'Manager' : 'Employee'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
      </div>
    </aside>
  );
};

export default Sidebar;