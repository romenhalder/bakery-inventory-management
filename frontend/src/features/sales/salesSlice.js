import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createSale = createAsyncThunk(
  'sales/create',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale');
    }
  }
);

export const fetchRecentSales = createAsyncThunk(
  'sales/fetchRecent',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSaleByOrderNumber = createAsyncThunk(
  'sales/fetchByOrderNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/order/${orderNumber}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Sale not found');
    }
  }
);

export const fetchSalesByCustomer = createAsyncThunk(
  'sales/fetchByCustomer',
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sales/customer/${mobile}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchTodaySummary = createAsyncThunk(
  'sales/fetchTodaySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sales/summary/today');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState: {
    currentSale: null,
    recentSales: [],
    todaySummary: {
      totalSales: 0,
      transactionCount: 0,
    },
    cart: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find((item) => item.productId === product.id);
      
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty <= product.availableStock) {
          existingItem.quantity = newQty;
          existingItem.totalPrice = existingItem.unitPrice * newQty;
        }
      } else {
        state.cart.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        });
      }
    },
    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.find((i) => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        item.totalPrice = item.unitPrice * quantity;
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.productId !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
      state.currentSale = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
        state.cart = [];
        state.success = true;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchRecentSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.loading = false;
        state.recentSales = action.payload;
      })
      .addCase(fetchRecentSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSaleByOrderNumber.fulfilled, (state, action) => {
        state.currentSale = action.payload;
      })
      .addCase(fetchTodaySummary.fulfilled, (state, action) => {
        state.todaySummary = action.payload;
      });
  },
});

export const { 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  clearError, 
  clearSuccess 
} = salesSlice.actions;

export default salesSlice.reducer;
