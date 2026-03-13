import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import alertReducer from '../features/alerts/alertSlice';
import reportReducer from '../features/reports/reportSlice';
import salesReducer from '../features/sales/salesSlice';
import supplierReducer from '../features/auth/supplierSlice';
import bookingReducer from '../features/bookings/bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    inventory: inventoryReducer,
    alerts: alertReducer,
    reports: reportReducer,
    sales: salesReducer,
    suppliers: supplierReducer,
    bookings: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setCredentials'],
      },
    }),
});

export default store;
