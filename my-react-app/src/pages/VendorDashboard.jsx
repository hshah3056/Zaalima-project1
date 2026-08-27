import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Package, Plus, Edit3, Check, X, UploadCloud, 
  RefreshCw, DollarSign, Layers, ArrowLeft, ShieldAlert,
  Trash2, Star, TrendingUp, AlertTriangle, Store, Search, Filter, Sparkles,
  LayoutDashboard, ShoppingCart, Settings, LogOut, ExternalLink, ChevronRight,
  Clock, CheckCircle, Truck, User, Eye, ShieldCheck, Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { logout, setAuthModalOpen } from '../store/authSlice';

const API_BASE = 'http://127.0.0.1:5001/api';

export default function VendorDashboard() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);

  const activeTenant = tenantsList.find((t) => t.tenantId === (user?.tenantId || activeTenantId)) || tenantsList[0];

  // Active Menu Tab State ('overview', 'products', 'orders', 'settings')
  const [activeTab, setActiveTab] = useState('overview');

  // Products Data & Loading
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');

  // Orders Data State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Store Settings Form State
  const [storeForm, setStoreForm] = useState({
    name: activeTenant?.name || 'Mydeal Store',
    tagline: activeTenant?.tagline || '',
    themeColor: activeTenant?.themeColor || '#e40046',
    bannerTitle: activeTenant?.bannerTitle || '',
    bannerSubtitle: activeTenant?.bannerSubtitle || ''
  });
  const [savingStore, setSavingStore] = useState(false);
  const [storeSavedSuccess, setStoreSavedSuccess] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    stock: '25',
    discount: '',
    isDealOfTheDay: false,
    image: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // 1. Fetch Inventory Products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      const res = await axios.get(`${API_BASE}/products`, {
        headers: {
          'x-tenant-id': tenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      let items = [];
      if (res.data?.data) items = res.data.data;
      else if (res.data?.products) items = res.data.products;
      else if (Array.isArray(res.data)) items = res.data;

      setProducts(items);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 2. Fetch Customer Orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      const res = await axios.get(`${API_BASE}/orders`, {
        headers: {
          'x-tenant-id': tenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      let items = [];
      if (res.data?.data) items = res.data.data;
      else if (res.data?.orders) items = res.data.orders;
      else if (Array.isArray(res.data)) items = res.data;

      setOrders(items);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    if (activeTenant) {
      setStoreForm({
        name: activeTenant.name || '',
        tagline: activeTenant.tagline || '',
        themeColor: activeTenant.themeColor || '#e40046',
        bannerTitle: activeTenant.bannerTitle || '',
        bannerSubtitle: activeTenant.bannerSubtitle || ''
      });
    }
  }, [activeTenantId, user]);

  // Analytics KPI Metrics
  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 1), 0);
    const lowStockCount = products.filter((p) => (Number(p.stock) || 0) <= 5).length;
    const activeDealsCount = products.filter((p) => p.isDealOfTheDay).length;

    const totalOrdersCount = orders.length;
    const totalSalesRevenue = orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    return { totalItems, totalValue, lowStockCount, activeDealsCount, totalOrdersCount, totalSalesRevenue };
  }, [products, orders]);

  // Category Distribution Metrics
  const categoryStats = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({ category, count }));
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCatFilter === 'All' || p.category === selectedCatFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCatFilter]);

  const categoriesList = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  // Handle Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.imageUrl) {
        setNewProduct((prev) => ({ ...prev, image: res.data.imageUrl }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Inline Quick Edit Products
  const handleStartInlineEdit = (product) => {
    setEditingId(product._id || product.id);
    setEditFormData({
      price: product.price,
      stock: product.stock || 10,
      category: product.category || 'Electronics',
      isDealOfTheDay: product.isDealOfTheDay || false
    });
  };

  const handleSaveInlineEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      await axios.put(`${API_BASE}/products/${id}`, editFormData, {
        headers: {
          'x-tenant-id': tenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...editFormData } : p))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Inline update failed:', err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from inventory?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      alert('Please fill in required fields (Title and Price)');
      return;
    }

    try {
      setSubmittingProduct(true);
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      const payload = {
        name: newProduct.title,
        brand: newProduct.brand || activeTenant?.name || 'Generic Brand',
        price: Number(newProduct.price),
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : Math.round(Number(newProduct.price) * 1.3),
        category: newProduct.category,
        stock: Number(newProduct.stock) || 25,
        isDealOfTheDay: newProduct.isDealOfTheDay,
        image: newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
      };

      const res = await axios.post(`${API_BASE}/products`, payload, {
        headers: {
          'x-tenant-id': tenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.data?.data) {
        setProducts((prev) => [res.data.data, ...prev]);
      }

      setIsModalOpen(false);
      setNewProduct({
        title: '',
        brand: '',
        category: 'Electronics',
        price: '',
        originalPrice: '',
        stock: '25',
        discount: '',
        isDealOfTheDay: false,
        image: ''
      });
      setImagePreview(null);
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('Error creating product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      await axios.put(
        `${API_BASE}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            'x-tenant-id': tenantId,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Save Store Settings
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingStore(true);
      const token = localStorage.getItem('token');
      const tenantId = user?.tenantId || activeTenantId;

      await axios.put(`${API_BASE}/stores/${tenantId}`, storeForm, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      setStoreSavedSuccess(true);
      setTimeout(() => setStoreSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save store settings:', err);
    } finally {
      setSavingStore(false);
    }
  };

  // RBAC Access Control Guard
  if (isAuthenticated && role !== 'vendor' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-200">
          <ShieldAlert className="w-16 h-16 text-[#e40046] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vendor Access Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your current account role (<strong>{role}</strong>) does not have vendor access permissions.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#e40046] text-white px-5 py-2.5 rounded font-bold text-sm hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* LEFT NAVIGATION SIDEBAR MENU */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between border-r border-slate-800 shadow-xl">
        
        <div>
          {/* Store Branding Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e40046] flex items-center justify-center text-white shadow-md font-black text-lg">
              <Store className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="font-extrabold text-sm text-white truncate">
                {activeTenant?.name || 'Mydeal Vendor'}
              </div>
              <div className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {role || 'VENDOR'} PORTAL
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            
            {/* Overview / Dashboard */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#e40046] text-white font-bold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Products & Inventory CRUD */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'products'
                  ? 'bg-[#e40046] text-white font-bold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Products & Inventory</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            {/* Customer Orders */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#e40046] text-white font-bold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Customer Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Store Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#e40046] text-white font-bold shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Store Settings</span>
              </div>
            </button>

          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          
          {/* Link to Storefront */}
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4 text-yellow-300" />
            <span>View Live Storefront</span>
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                {user?.name?.charAt(0) || 'V'}
              </div>
              <div className="truncate text-[11px]">
                <div className="font-bold text-slate-200 truncate">{user?.name || 'Vendor User'}</div>
                <div className="text-slate-400 text-[9px] truncate">{user?.email || 'vendor@example.com'}</div>
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* RIGHT MAIN CONTENT DISPLAY AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize flex items-center gap-2">
              {activeTab === 'overview' && <><LayoutDashboard className="w-5 h-5 text-[#e40046]" /> Executive Dashboard Overview</>}
              {activeTab === 'products' && <><Package className="w-5 h-5 text-[#e40046]" /> Inventory & Product Management</>}
              {activeTab === 'orders' && <><ShoppingCart className="w-5 h-5 text-[#e40046]" /> Customer Orders & Fulfilment</>}
              {activeTab === 'settings' && <><Settings className="w-5 h-5 text-[#e40046]" /> Store Customization Settings</>}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-tenant store partition: <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{activeTenant?.tenantId}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#e40046] hover:bg-[#c7003d] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            )}
            <button
              onClick={() => { fetchProducts(); fetchOrders(); }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingProducts || loadingOrders) ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <main className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Inventory */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">{metrics.totalItems}</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Live catalog items
                  </div>
                </div>
                <div className="p-3.5 bg-red-50 text-[#e40046] rounded-xl border border-red-100">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              {/* Total Sales Revenue */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Revenue</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">₹{metrics.totalSalesRevenue.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" /> {metrics.totalOrdersCount} Customer Orders
                  </div>
                </div>
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</div>
                  <div className="text-3xl font-black text-amber-600 mt-1">{metrics.lowStockCount}</div>
                  <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Stock ≤ 5 items
                  </div>
                </div>
                <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Active Deals */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deal of the Day</div>
                  <div className="text-3xl font-black text-purple-600 mt-1">{metrics.activeDealsCount}</div>
                  <div className="text-[11px] text-purple-600 font-bold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured deals
                  </div>
                </div>
                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                  <Star className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Visual Distribution & Quick Shortcuts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category Inventory Breakdown */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#e40046]" /> Inventory Breakdown by Category
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{categoryStats.length} Categories</span>
                </div>

                <div className="space-y-3">
                  {categoryStats.map((item) => {
                    const percentage = Math.round((item.count / (products.length || 1)) * 100);
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{item.category}</span>
                          <span className="text-slate-500">{item.count} items ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#e40046] to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" /> Vendor Shortcuts
                  </h3>
                  <div className="mt-4 space-y-2 text-xs font-semibold">
                    <button
                      onClick={() => { setActiveTab('products'); setIsModalOpen(true); }}
                      className="w-full p-3 bg-red-50 hover:bg-red-100 text-[#e40046] rounded-lg text-left flex items-center justify-between transition-colors border border-red-100"
                    >
                      <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Inventory Product</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left flex items-center justify-between transition-colors border border-blue-100"
                    >
                      <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> View Customer Orders ({orders.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-left flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Customize Store Branding</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2">
                  <div className="text-xs font-bold text-yellow-300">Live Multi-Tenant Partition</div>
                  <p className="text-[11px] text-slate-300">
                    Store ID: <strong>{activeTenant?.tenantId}</strong>
                  </p>
                </div>
              </div>

            </div>

          </main>
        )}

        {/* TAB 2: PRODUCTS & INVENTORY CRUD */}
        {activeTab === 'products' && (
          <main className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* Search & Category Filter Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#e40046]"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>

            {/* Inventory Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Product Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Stock Status</th>
                      <th className="py-3.5 px-4">Deal Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e40046]" />
                          Loading live inventory dataset...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          No items matching search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const id = p._id || p.id;
                        const isEditing = editingId === id;

                        return (
                          <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                                  <img
                                    src={p.image || 'https://via.placeholder.com/80'}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium">{p.brand || activeTenant?.name}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {isEditing ? (
                                <select
                                  value={editFormData.category}
                                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                                >
                                  <option value="Audio">Audio</option>
                                  <option value="Laptops & Computers">Laptops & Computers</option>
                                  <option value="Electronics">Electronics</option>
                                  <option value="Men's Fashion">Men's Fashion</option>
                                  <option value="Women's Fashion">Women's Fashion</option>
                                  <option value="Home & Kitchen">Home & Kitchen</option>
                                </select>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded text-[10px] uppercase">
                                  {p.category}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editFormData.price}
                                  onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                                  className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                />
                              ) : (
                                <div>
                                  <div className="font-black text-slate-900">₹{p.price?.toLocaleString('en-IN')}</div>
                                  {p.originalPrice && p.originalPrice > p.price && (
                                    <div className="text-[10px] text-slate-400 line-through">₹{p.originalPrice?.toLocaleString('en-IN')}</div>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editFormData.stock}
                                  onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                                  className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                                />
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded text-[10px] ${
                                    (p.stock || 0) <= 5
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {p.stock || 0} units
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {p.isDealOfTheDay ? (
                                <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1 w-fit">
                                  <Star className="w-3 h-3 fill-purple-600 text-purple-600" /> Active Deal
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">Standard Item</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveInlineEdit(id)}
                                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                                      title="Save Changes"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="p-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleStartInlineEdit(p)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                                      title="Quick Edit"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-[#e40046] rounded transition-colors"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        )}

        {/* TAB 3: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <main className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order ID & Date</th>
                      <th className="py-3.5 px-4">Customer Info</th>
                      <th className="py-3.5 px-4">Items Count</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Fulfillment Status</th>
                      <th className="py-3.5 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e40046]" />
                          Loading customer orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          No customer orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => {
                        const orderId = o._id || o.id;
                        return (
                          <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-slate-900">#{orderId.substring(0, 8)}</div>
                              <div className="text-[10px] text-slate-400">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800">{o.customerName || 'Customer'}</div>
                              <div className="text-[10px] text-slate-400">{o.customerEmail || 'N/A'}</div>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-700">
                              {o.items?.length || 1} items
                            </td>

                            <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                              ₹{o.totalAmount?.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                  o.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.status || 'Pending'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <select
                                value={o.status || 'Pending'}
                                onChange={(e) => handleUpdateOrderStatus(orderId, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#e40046]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </main>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <main className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
              
              <div>
                <h3 className="text-base font-bold text-slate-900">Store Front Customization</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Update your multi-tenant store branding parameters saved in MongoDB
                </p>
              </div>

              {storeSavedSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Store branding settings updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store Tagline</label>
                  <input
                    type="text"
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Banner Title</label>
                  <input
                    type="text"
                    value={storeForm.bannerTitle}
                    onChange={(e) => setStoreForm({ ...storeForm, bannerTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Banner Subtitle</label>
                  <textarea
                    rows="2"
                    value={storeForm.bannerSubtitle}
                    onChange={(e) => setStoreForm({ ...storeForm, bannerSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStore}
                    className="px-6 py-2.5 bg-[#e40046] hover:bg-[#c7003d] text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {savingStore ? 'Saving...' : 'Save Store Branding'}
                  </button>
                </div>

              </form>

            </div>

          </main>
        )}

      </div>

      {/* Modal: Add New Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#e40046]" />
                <h3 className="font-bold text-base">Add New Product to Inventory</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Bluetooth Noise Cancelling Headphones"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony / boAt / HP"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046]"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Laptops & Computers">Laptops & Computers</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Men's Fashion">Men's Fashion</option>
                    <option value="Women's Fashion">Women's Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (MRP)</label>
                  <input
                    type="number"
                    placeholder="3990"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#e40046]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <input
                  type="checkbox"
                  id="dealToggle"
                  checked={newProduct.isDealOfTheDay}
                  onChange={(e) => setNewProduct({ ...newProduct, isDealOfTheDay: e.target.checked })}
                  className="w-4 h-4 text-[#e40046] rounded focus:ring-0"
                />
                <label htmlFor="dealToggle" className="font-bold text-purple-900 cursor-pointer flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600" /> Feature as "Deal of the Day" on Store Homepage
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Image</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#e40046] rounded-lg p-4 text-center transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-1">
                    <UploadCloud className="w-8 h-8 text-[#e40046]" />
                    <span className="font-semibold text-slate-700">Click to upload product image file</span>
                    <span className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP (Uploaded to Cloudinary)</span>
                  </label>

                  {uploading && <div className="text-xs text-[#e40046] font-bold mt-2 animate-pulse">Uploading file to Cloudinary...</div>}

                  {imagePreview && (
                    <div className="mt-3 w-20 h-20 mx-auto rounded border border-slate-200 overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-6 py-2 bg-[#e40046] hover:bg-[#c7003d] text-white rounded-lg font-bold transition-all shadow"
                >
                  {submittingProduct ? 'Creating Product...' : 'Create & Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}