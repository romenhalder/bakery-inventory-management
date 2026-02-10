import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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

// Async thunks
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const fetchUnreadAlerts = createAsyncThunk(
  'alerts/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/alerts/unread');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }
);

export const markAlertAsRead = createAsyncThunk(
  'alerts/markAsRead',
  async (alertId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark alert as read');
    }
  }
);

export const markAllAlertsAsRead = createAsyncThunk(
  'alerts/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/alerts/read-all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all alerts as read');
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (alertId, { rejectWithValue }) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      return alertId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete alert');
    }
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    unreadAlerts: [],
    unreadCount: 0,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch unread alerts
      .addCase(fetchUnreadAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadAlerts = action.payload;
        state.unreadCount = action.payload.length;
      })
      .addCase(fetchUnreadAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markAlertAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
        state.unreadAlerts = state.unreadAlerts.filter((a) => a.id !== action.payload.id);
        state.unreadCount = state.unreadAlerts.length;
      })
      .addCase(markAlertAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark all as read
      .addCase(markAllAlertsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAlertsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.alerts = state.alerts.map((a) => ({ ...a, isRead: true }));
        state.unreadAlerts = [];
        state.unreadCount = 0;
      })
      .addCase(markAllAlertsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete alert
      .addCase(deleteAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = state.alerts.filter((a) => a.id !== action.payload);
        state.unreadAlerts = state.unreadAlerts.filter((a) => a.id !== action.payload);
        state.unreadCount = state.unreadAlerts.length;
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = alertSlice.actions;
export default alertSlice.reducer;
