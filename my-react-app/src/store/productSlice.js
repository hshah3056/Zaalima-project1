import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Comprehensive static dataset for multi-tenant e-commerce store
const STATIC_PRODUCTS = [
  // Tenant 1: Snapdeal MegaStore (tenant-megastore)
  {
    _id: 'p-meta-1',
    tenantId: 'tenant-megastore',
    name: 'Boat Rockerz 450 Bluetooth Wireless On-Ear Headphones',
    brand: 'boAt',
    price: 1299,
    originalPrice: 3990,
    discount: '67% OFF',
    rating: 4.5,
    reviewsCount: 1240,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-meta-2',
    tenantId: 'tenant-megastore',
    name: 'HP 15s Intel Core i5 12th Gen Thin & Light Laptop',
    brand: 'HP',
    price: 49990,
    originalPrice: 65000,
    discount: '23% OFF',
    rating: 4.6,
    reviewsCount: 850,
    category: 'Laptops & Computers',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-meta-3',
    tenantId: 'tenant-megastore',
    name: 'Noise ColorFit Pulse Smartwatch with SpO2 & Heart Rate Monitor',
    brand: 'Noise',
    price: 1499,
    originalPrice: 4999,
    discount: '70% OFF',
    rating: 4.3,
    reviewsCount: 2310,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-meta-4',
    tenantId: 'tenant-megastore',
    name: "Men's Slim Fit Printed Cotton Casual Shirt",
    brand: 'Roadster',
    price: 699,
    originalPrice: 1999,
    discount: '65% OFF',
    rating: 4.2,
    reviewsCount: 430,
    category: "Men's Fashion",
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-meta-5',
    tenantId: 'tenant-megastore',
    name: 'Prestige Stainless Steel Non-Stick Cookware Set (3 Pcs)',
    brand: 'Prestige',
    price: 1899,
    originalPrice: 3999,
    discount: '52% OFF',
    rating: 4.4,
    reviewsCount: 560,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-meta-6',
    tenantId: 'tenant-megastore',
    name: "Women's Anarkali Kurta Set with Chiffon Dupatta",
    brand: 'Biba',
    price: 1249,
    originalPrice: 3499,
    discount: '64% OFF',
    rating: 4.5,
    reviewsCount: 780,
    category: "Women's Fashion",
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
    isDealOfTheDay: true
  },

  // Tenant 2: Zaalima Style & Fashion (tenant-fashion)
  {
    _id: 'p-fash-1',
    tenantId: 'tenant-fashion',
    name: "Women's Designer Embroidered Silk Saree with Blouse Piece",
    brand: 'Zaalima Couture',
    price: 1899,
    originalPrice: 4999,
    discount: '62% OFF',
    rating: 4.7,
    reviewsCount: 1560,
    category: "Women's Fashion",
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-fash-2',
    tenantId: 'tenant-fashion',
    name: "Men's Premium Denim Jacket with Vintage Wash",
    brand: 'Levis',
    price: 1499,
    originalPrice: 3999,
    discount: '62% OFF',
    rating: 4.4,
    reviewsCount: 620,
    category: "Men's Fashion",
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-fash-3',
    tenantId: 'tenant-fashion',
    name: "Women's Casual Floral A-Line Summer Dress",
    brand: 'Zara Style',
    price: 899,
    originalPrice: 2499,
    discount: '64% OFF',
    rating: 4.3,
    reviewsCount: 390,
    category: "Women's Fashion",
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-fash-4',
    tenantId: 'tenant-fashion',
    name: "Men's Genuine Leather Formal Oxford Shoes",
    brand: 'Red Tape',
    price: 1799,
    originalPrice: 4499,
    discount: '60% OFF',
    rating: 4.5,
    reviewsCount: 880,
    category: "Men's Fashion",
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-fash-5',
    tenantId: 'tenant-fashion',
    name: 'Designer Faux Leather Handbag for Women',
    brand: 'Lavie',
    price: 1199,
    originalPrice: 2999,
    discount: '60% OFF',
    rating: 4.6,
    reviewsCount: 1120,
    category: "Women's Fashion",
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
    isDealOfTheDay: false
  },

  // Tenant 3: TechHub Electronics Store (tenant-techhub)
  {
    _id: 'p-tech-1',
    tenantId: 'tenant-techhub',
    name: 'Apple iPad Air (5th Gen) 10.9-inch Wi-Fi 64GB',
    brand: 'Apple',
    price: 54900,
    originalPrice: 59900,
    discount: '8% OFF',
    rating: 4.8,
    reviewsCount: 3200,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-tech-2',
    tenantId: 'tenant-techhub',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    price: 26990,
    originalPrice: 34990,
    discount: '22% OFF',
    rating: 4.9,
    reviewsCount: 2150,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80',
    isDealOfTheDay: true
  },
  {
    _id: 'p-tech-3',
    tenantId: 'tenant-techhub',
    name: 'Samsung 27-inch 4K IPS Ultra-Slim Gaming Monitor',
    brand: 'Samsung',
    price: 24499,
    originalPrice: 32000,
    discount: '23% OFF',
    rating: 4.7,
    reviewsCount: 740,
    category: 'Laptops & Computers',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-tech-4',
    tenantId: 'tenant-techhub',
    name: 'Logitech MX Master 3S Performance Wireless Mouse',
    brand: 'Logitech',
    price: 7995,
    originalPrice: 10995,
    discount: '27% OFF',
    rating: 4.8,
    reviewsCount: 1890,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
    isDealOfTheDay: false
  },
  {
    _id: 'p-tech-5',
    tenantId: 'tenant-techhub',
    name: 'RGB Mechanical Gaming Keyboard with Tactile Switches',
    brand: 'Razer',
    price: 3499,
    originalPrice: 6999,
    discount: '50% OFF',
    rating: 4.5,
    reviewsCount: 940,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    isDealOfTheDay: false
  }
];

// Dynamic fetch products thunk (attempts backend API call, falls back to static dataset)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ tenantId = 'tenant-megastore', category = 'All', search = '', dealOfTheDay = false }) => {
    try {
      let url = `http://127.0.0.1:5001/api/products?`;
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      if (dealOfTheDay) params.append('dealOfTheDay', 'true');
      url += params.toString();

      const response = await fetch(url, {
        headers: { 'x-tenant-id': tenantId }
      });
      const data = await response.json();
      if (data.success && data.data) {
        return {
          data: data.data,
          categories: data.categories || ['All']
        };
      }
    } catch (err) {
      console.warn('Backend API server offline, loading fallback dataset:', err.message);
    }

    // Fallback static filtering
    let filtered = STATIC_PRODUCTS.filter((p) => p.tenantId === tenantId);

    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (dealOfTheDay) {
      filtered = filtered.filter((p) => p.isDealOfTheDay);
    }

    const categories = ['All', ...new Set(STATIC_PRODUCTS.filter((p) => p.tenantId === tenantId).map((p) => p.category))];

    return {
      data: filtered,
      categories
    };
  }
);

const initialState = {
  items: STATIC_PRODUCTS.filter((p) => p.tenantId === 'tenant-megastore'),
  categories: ['All', 'Audio', 'Laptops & Computers', 'Electronics', "Men's Fashion", 'Home & Kitchen', "Women's Fashion"],
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
        state.loading = false;
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
      });
  }
});

export const { setSelectedCategory, setSearchTerm } = productSlice.actions;
export default productSlice.reducer;

