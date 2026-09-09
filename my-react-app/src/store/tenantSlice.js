import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch all available stores dynamically from Express API & MongoDB
export const fetchTenants = createAsyncThunk('tenant/fetchTenants', async () => {
  try {
    const response = await fetch('http://127.0.0.1:5001/api/stores');
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('Backend API server offline:', err.message);
  }
  return [];
});

const initialState = {
  activeTenantId: localStorage.getItem('activeTenantId') || 'tenant-megastore',
  tenantsList: [],
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
        state.tenantsList = action.payload || [];
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.tenantsList = [];
      });
  }
});

export const { setTenantId } = tenantSlice.actions;
export default tenantSlice.reducer;
