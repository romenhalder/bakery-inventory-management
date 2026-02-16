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
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';

  const adminLinks = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/products', icon: ShoppingBagIcon, label: 'Products' },
    { to: '/inventory', icon: ArchiveBoxIcon, label: 'Inventory' },
    { to: '/alerts', icon: ExclamationTriangleIcon, label: 'Alerts' },
    { to: '/employees', icon: UsersIcon, label: 'Employees' },
    { to: '/password-reset-requests', icon: KeyIcon, label: 'Password Requests' },
    { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
  ];

  const managerLinks = [
    { to: '/employee-dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/products', icon: ShoppingBagIcon, label: 'Products' },
    { to: '/inventory', icon: ArchiveBoxIcon, label: 'Inventory' },
    { to: '/alerts', icon: ExclamationTriangleIcon, label: 'Alerts' },
    { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
  ];

  const employeeLinks = [
    { to: '/employee-dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/products', icon: ShoppingBagIcon, label: 'Products' },
    { to: '/inventory', icon: ArchiveBoxIcon, label: 'Inventory' },
    { to: '/alerts', icon: ExclamationTriangleIcon, label: 'Alerts' },
  ];

  const links = isAdmin ? adminLinks : isManager ? managerLinks : employeeLinks;

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to || 
                          (link.to !== '/' && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full ${
            isAdmin ? 'bg-green-500' : isManager ? 'bg-purple-500' : 'bg-blue-500'
          }`} />
          <span>{isAdmin ? 'Administrator' : isManager ? 'Manager' : 'Employee'}</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;