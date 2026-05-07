import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_URL } from '../../config/api';
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Catalog
export const fetchCatalog = createAsyncThunk('bookings/fetchCatalog', async (_, { rejectWithValue }) => {
    try { return (await api.get('/bookings/catalog')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const createCatalogItem = createAsyncThunk('bookings/createCatalog', async (data, { rejectWithValue }) => {
    try { return (await api.post('/bookings/catalog', data)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const updateCatalogItem = createAsyncThunk('bookings/updateCatalog', async ({ id, data }, { rejectWithValue }) => {
    try { return (await api.put(`/bookings/catalog/${id}`, data)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const deleteCatalogItem = createAsyncThunk('bookings/deleteCatalog', async (id, { rejectWithValue }) => {
    try { await api.delete(`/bookings/catalog/${id}`); return id; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const uploadCatalogImage = createAsyncThunk('bookings/uploadCatalogImage', async ({ id, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/bookings/catalog/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { id, imageUrl: response.data.imageUrl };
    } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed to upload image'); }
});

// Bookings
export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (_, { rejectWithValue }) => {
    try { return (await api.get('/bookings')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchActiveBookings = createAsyncThunk('bookings/fetchActive', async (_, { rejectWithValue }) => {
    try { return (await api.get('/bookings/active')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchUpcoming = createAsyncThunk('bookings/fetchUpcoming', async (_, { rejectWithValue }) => {
    try { return (await api.get('/bookings/upcoming')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const fetchBookingStats = createAsyncThunk('bookings/fetchStats', async (_, { rejectWithValue }) => {
    try { return (await api.get('/bookings/stats')).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const createBooking = createAsyncThunk('bookings/create', async (data, { rejectWithValue }) => {
    try { return (await api.post('/bookings', data)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});
export const updateBooking = createAsyncThunk('bookings/update', async ({ id, data }, { rejectWithValue }) => {
    try { return (await api.put(`/bookings/${id}`, data)).data; } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const bookingSlice = createSlice({
    name: 'bookings',
    initialState: {
        catalog: [], bookings: [], upcoming: [], stats: null,
        loading: false, error: null, success: false,
    },
    reducers: {
        clearBookingError: (state) => { state.error = null; },
        clearBookingSuccess: (state) => { state.success = false; },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
        builder
            .addCase(fetchCatalog.pending, pending).addCase(fetchCatalog.fulfilled, (s, a) => { s.loading = false; s.catalog = a.payload; }).addCase(fetchCatalog.rejected, rejected)
            .addCase(createCatalogItem.pending, pending).addCase(createCatalogItem.fulfilled, (s, a) => { s.loading = false; s.catalog.push(a.payload); s.success = true; }).addCase(createCatalogItem.rejected, rejected)
            .addCase(updateCatalogItem.pending, pending).addCase(updateCatalogItem.fulfilled, (s, a) => { s.loading = false; const i = s.catalog.findIndex(c => c.id === a.payload.id); if (i >= 0) s.catalog[i] = a.payload; s.success = true; }).addCase(updateCatalogItem.rejected, rejected)
            .addCase(deleteCatalogItem.pending, pending).addCase(deleteCatalogItem.fulfilled, (s, a) => { s.loading = false; s.catalog = s.catalog.filter(c => c.id !== a.payload); s.success = true; }).addCase(deleteCatalogItem.rejected, rejected)
            .addCase(uploadCatalogImage.fulfilled, (s, a) => { const i = s.catalog.findIndex(c => c.id === a.payload.id); if (i >= 0) s.catalog[i] = { ...s.catalog[i], imageUrl: a.payload.imageUrl }; })
            .addCase(fetchBookings.pending, pending).addCase(fetchBookings.fulfilled, (s, a) => { s.loading = false; s.bookings = a.payload; }).addCase(fetchBookings.rejected, rejected)
            .addCase(fetchActiveBookings.pending, pending).addCase(fetchActiveBookings.fulfilled, (s, a) => { s.loading = false; s.bookings = a.payload; }).addCase(fetchActiveBookings.rejected, rejected)
            .addCase(fetchUpcoming.pending, pending).addCase(fetchUpcoming.fulfilled, (s, a) => { s.loading = false; s.upcoming = a.payload; }).addCase(fetchUpcoming.rejected, rejected)
            .addCase(fetchBookingStats.pending, pending).addCase(fetchBookingStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; }).addCase(fetchBookingStats.rejected, rejected)
            .addCase(createBooking.pending, pending).addCase(createBooking.fulfilled, (s, a) => { s.loading = false; s.bookings.unshift(a.payload); s.success = true; }).addCase(createBooking.rejected, rejected)
            .addCase(updateBooking.pending, pending).addCase(updateBooking.fulfilled, (s, a) => { s.loading = false; const i = s.bookings.findIndex(b => b.id === a.payload.id); if (i >= 0) s.bookings[i] = a.payload; s.success = true; }).addCase(updateBooking.rejected, rejected);
    },
});

export const { clearBookingError, clearBookingSuccess } = bookingSlice.actions;
export default bookingSlice.reducer;
