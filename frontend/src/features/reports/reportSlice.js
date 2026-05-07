import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_URL } from '../../config/api';

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

const formatDateForBackend = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'reports/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchStockReport = createAsyncThunk(
  'reports/fetchStock',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const formattedStart = formatDateForBackend(startDate);
      const formattedEnd = formatDateForBackend(endDate);
      const response = await api.get(`/reports/stock?startDate=${formattedStart}&endDate=${formattedEnd}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock report');
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  'reports/fetchSales',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const formattedStart = formatDateForBackend(startDate);
      const formattedEnd = formatDateForBackend(endDate);
      const response = await api.get(`/reports/sales?startDate=${formattedStart}&endDate=${formattedEnd}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchUsageReport = createAsyncThunk(
  'reports/fetchUsage',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const formattedStart = formatDateForBackend(startDate);
      const formattedEnd = formatDateForBackend(endDate);
      const response = await api.get(`/reports/usage?startDate=${formattedStart}&endDate=${formattedEnd}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch usage report');
    }
  }
);

export const downloadReportPDF = createAsyncThunk(
  'reports/downloadPDF',
  async ({ type, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${type}/pdf?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${startDate}-to-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download PDF');
    }
  }
);

export const downloadReportCSV = createAsyncThunk(
  'reports/downloadCSV',
  async ({ type, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${type}/csv?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download CSV');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    analytics: null,
    stockReport: null,
    salesReport: null,
    usageReport: null,
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
    clearReports: (state) => {
      state.stockReport = null;
      state.salesReport = null;
      state.usageReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Stock report
      .addCase(fetchStockReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockReport.fulfilled, (state, action) => {
        state.loading = false;
        state.stockReport = action.payload;
      })
      .addCase(fetchStockReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sales report
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Usage report
      .addCase(fetchUsageReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsageReport.fulfilled, (state, action) => {
        state.loading = false;
        state.usageReport = action.payload;
      })
      .addCase(fetchUsageReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Download PDF
      .addCase(downloadReportPDF.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadReportPDF.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(downloadReportPDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Download CSV
      .addCase(downloadReportCSV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadReportCSV.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(downloadReportCSV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearReports } = reportSlice.actions;
export default reportSlice.reducer;

