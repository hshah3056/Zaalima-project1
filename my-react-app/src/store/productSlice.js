import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch products dynamically from Express API & MongoDB
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ tenantId, category, search, dealOfTheDay } = {}) => {
    try {
      let url = `http://127.0.0.1:5001/api/products?`;
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (dealOfTheDay) params.append('dealOfTheDay', 'true');
      url += params.toString();

      const response = await fetch(url, {
        headers: { 'x-tenant-id': tenantId || 'tenant-megastore' }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        return {
          data: data.data,
          categories: data.categories || ['All']
        };
      }
    } catch (err) {
      console.warn('Backend API error when fetching products:', err.message);
    }

    return {
      data: [],
      categories: ['All']
    };
  }
);

const initialState = {
  items: [],
  categories: ['All'],
  selectedCategory: 'All',
  searchTerm: '',
  loading: false,
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        if (action.payload.categories) {
          state.categories = action.payload.categories;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.items = [];
      });
  }
});

export const { setSelectedCategory, setSearchTerm } = productSlice.actions;
export default productSlice.reducer;
