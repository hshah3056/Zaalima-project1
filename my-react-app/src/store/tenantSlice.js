import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const DEFAULT_TENANTS = [
  {
    tenantId: 'tenant-megastore',
    name: 'Mydeal MegaStore',
    tagline: 'India’s Favorite Online Shopping Destination',
    themeColor: '#e40046',
    bannerTitle: 'Mega Shopping Festival',
    bannerSubtitle: 'Up to 80% OFF on Top Electronics, Fashion & Home'
  },
  {
    tenantId: 'tenant-fashion',
    name: 'Zaalima Style & Fashion',
    tagline: 'Trendy & Affordable Fashion For Everyone',
    themeColor: '#d32f2f',
    bannerTitle: 'New Fashion Season Collection',
    bannerSubtitle: 'Flat 60% OFF on Ethnic Wear, Footwear & Accessories'
  },
  {
    tenantId: 'tenant-techhub',
    name: 'TechHub Electronics Store',
    tagline: 'Next-Gen Gadgets & Smart Electronics',
    themeColor: '#1976d2',
    bannerTitle: 'Tech Revolution Sale',
    bannerSubtitle: 'Exclusive Discounts on Laptops, Audio & Smartwatches'
  }
];

// Fetch all available tenants dynamically from Express API with fallback
export const fetchTenants = createAsyncThunk('tenant/fetchTenants', async () => {
  try {
    const response = await fetch('http://127.0.0.1:5001/api/stores');
    const data = await response.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }
  } catch (err) {
    console.warn('Backend API server offline, loading default store list:', err.message);
  }
  return DEFAULT_TENANTS;
});

const initialState = {
  activeTenantId: localStorage.getItem('activeTenantId') || 'tenant-megastore',
  tenantsList: DEFAULT_TENANTS,
  loading: false,
  error: null
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantId: (state, action) => {
      state.activeTenantId = action.payload;
      localStorage.setItem('activeTenantId', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.tenantsList = action.payload;
        }
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setTenantId } = tenantSlice.actions;
export default tenantSlice.reducer;
