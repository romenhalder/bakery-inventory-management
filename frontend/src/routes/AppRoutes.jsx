import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../features/auth/Login';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';
import Setup from '../pages/Setup';
import EmployeeManagement from '../features/auth/EmployeeManagement';
import AdminDashboard from '../pages/AdminDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import PasswordResetRequests from '../pages/PasswordResetRequests';
import ProductList from '../features/products/ProductList';
import RawMaterialList from '../features/products/RawMaterialList';
import AddProduct from '../features/products/AddProduct';
import InventoryList from '../features/inventory/InventoryList';
import StockUpdate from '../features/inventory/StockUpdate';
import AlertList from '../features/alerts/AlertList';
import Reports from '../features/reports/Reports';
import SellProduct from '../features/sales/SellProduct';
import CategoryList from '../pages/CategoryList';
import SupplierList from '../pages/SupplierList';
import TransactionHistory from '../pages/TransactionHistory';
import BookingDashboard from '../features/bookings/BookingDashboard';
import CatalogManagement from '../features/bookings/CatalogManagement';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Setup Route - Must be before other routes */}
      <Route path="/setup" element={<Setup />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="password-reset-requests" element={<PasswordResetRequests />} />
        <Route path="products" element={<ProductList />} />
        <Route path="raw-materials" element={<RawMaterialList />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<AddProduct />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="inventory" element={<InventoryList />} />
        <Route path="inventory/update" element={<StockUpdate />} />
        <Route path="alerts" element={<AlertList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="sell" element={<SellProduct />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="bookings" element={<BookingDashboard />} />
        <Route path="bookings/catalog" element={<CatalogManagement />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;