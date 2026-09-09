import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setTenantId } from '../store/tenantSlice';
import { logout } from '../store/authSlice';
import { 
  Building2, DollarSign, ShoppingBag, Package, TrendingUp, 
  Store, ShieldCheck, ArrowUpRight, RefreshCw, BarChart2, Users, 
  Layers, ChevronRight, ExternalLink, Activity, Key, Check, Shield, User, Lock,
  Search, Filter, X, LogOut, MapPin, Mail, Calendar, BadgeCheck, Settings, Eye, Plus, Edit3, Trash2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';

const API_BASE = 'http://127.0.0.1:5001/api';

const COLORS = ['#e40046', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_products', label: 'Manage Products' },
  { id: 'manage_orders', label: 'Manage Orders' },
  { id: 'view_analytics', label: 'View Analytics' },
  { id: 'manage_stores', label: 'Manage Stores' },
  { id: 'manage_users', label: 'Manage Users' }
];

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { activeTenantId } = useSelector((state) => state.tenant);
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tenants' | 'vendors' | 'customers' | 'permissions'

  // Dynamic Stores & Users State
  const [storesList, setStoresList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Search Filters
  const [vendorSearch, setVendorSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modal States for Dynamic CRUD Operations
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeForm, setStoreForm] = useState({
    name: '',
    tagline: 'Official Brand Store',
    themeColor: '#e40046',
    bannerTitle: 'Mega Festival Sale',
    bannerSubtitle: 'Up to 80% OFF on Top Verified Products'
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '+91 9876543210',
    address: 'Connaught Place, Central Delhi, New Delhi',
    storeName: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSuperAdminAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/analytics/super-admin`);
      if (response.data?.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.warn('Super Admin analytics fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores`);
      if (res.data?.success) {
        setStoresList(res.data.data || []);
      }
    } catch (err) {
      console.warn('Stores fetch error:', err.message);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/users`, {
        headers: getAuthHeader()
      });
      if (res.data?.success) {
        setUsersList(res.data.data || []);
        const permMap = {};
        (res.data.data || []).forEach(u => {
          permMap[u._id] = u.permissions || [];
        });
        setEditingPermissions(permMap);
      }
    } catch (err) {
      console.warn('Users fetch error:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const refreshAllData = () => {
    fetchSuperAdminAnalytics();
    fetchStores();
    fetchUsers();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // STORE CRUD HANDLERS
  const handleOpenAddStore = () => {
    setEditingStore(null);
    setStoreForm({
      name: '',
      tagline: 'Official Brand Store',
      themeColor: '#e40046',
      bannerTitle: 'Mega Festival Sale',
      bannerSubtitle: 'Up to 80% OFF on Top Verified Products'
    });
    setIsStoreModalOpen(true);
  };

  const handleOpenEditStore = (store) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name || '',
      tagline: store.tagline || 'Official Brand Store',
      themeColor: store.themeColor || '#e40046',
      bannerTitle: store.bannerTitle || 'Mega Festival Sale',
      bannerSubtitle: store.bannerSubtitle || 'Up to 80% OFF on Top Verified Products'
    });
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!storeForm.name) return;
    setSubmitting(true);
    try {
      if (editingStore) {
        await axios.put(`${API_BASE}/stores/${editingStore.tenantId}`, storeForm, {
          headers: getAuthHeader()
        });
        setSaveSuccessMsg(`Store "${storeForm.name}" updated successfully!`);
      } else {
        await axios.post(`${API_BASE}/stores`, storeForm, {
          headers: getAuthHeader()
        });
        setSaveSuccessMsg(`Store "${storeForm.name}" created successfully!`);
      }
      setIsStoreModalOpen(false);
      refreshAllData();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStore = async (tenantId, name) => {
    if (!window.confirm(`Are you sure you want to delete store "${name}" (${tenantId})?`)) return;
    try {
      await axios.delete(`${API_BASE}/stores/${tenantId}`, {
        headers: getAuthHeader()
      });
      setSaveSuccessMsg(`Store deleted successfully`);
      refreshAllData();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // USER CRUD HANDLERS
  const handleOpenAddUser = (defaultRole = 'customer') => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      password: 'password123',
      role: defaultRole,
      phone: '+91 9876543210',
      address: 'Connaught Place, Central Delhi, New Delhi',
      storeName: defaultRole === 'vendor' ? 'New Vendor Store' : ''
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (usr) => {
    setEditingUser(usr);
    setUserForm({
      name: usr.name || '',
      email: usr.email || '',
      password: '',
      role: usr.role || 'customer',
      phone: usr.phone || '+91 9876543210',
      address: usr.address || 'Connaught Place, Central Delhi, New Delhi',
      storeName: usr.storeName || ''
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await axios.put(`${API_BASE}/auth/users/${editingUser._id}`, userForm, {
          headers: getAuthHeader()
        });
        setSaveSuccessMsg(`User "${userForm.name}" updated successfully!`);
      } else {
        await axios.post(`${API_BASE}/auth/users`, userForm, {
          headers: getAuthHeader()
        });
        setSaveSuccessMsg(`User "${userForm.name}" created successfully!`);
      }
      setIsUserModalOpen(false);
      refreshAllData();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/auth/users/${userId}`, {
        headers: getAuthHeader()
      });
      setSaveSuccessMsg(`User deleted successfully`);
      refreshAllData();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // PERMISSION TOGGLE HANDLERS
  const handleTogglePermission = (userId, permId) => {
    setEditingPermissions((prev) => {
      const current = prev[userId] || [];
      const updated = current.includes(permId)
        ? current.filter(p => p !== permId)
        : [...current, permId];
      return { ...prev, [userId]: updated };
    });
  };

  const handleSaveUserPermissions = async (userId) => {
    try {
      const perms = editingPermissions[userId] || [];
      await axios.put(
        `${API_BASE}/auth/users/${userId}/permissions`,
        { permissions: perms },
        { headers: getAuthHeader() }
      );
      setSaveSuccessMsg(`Permissions updated in MongoDB successfully`);
      refreshAllData();
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const summary = analyticsData?.summary || {
    totalPlatformRevenue: 0,
    totalPlatformOrders: 0,
    totalStoresCount: storesList.length,
    totalProductsCount: 0
  };

  const tenantComparison = analyticsData?.tenantComparison && analyticsData.tenantComparison.length > 0 
    ? analyticsData.tenantComparison 
    : storesList.map(s => ({
        tenantId: s.tenantId,
        storeName: s.name,
        totalRevenue: 0,
        orderCount: 0
      }));

  const platformTrend = analyticsData?.platformTrend || [];

  const vendorUsers = usersList.filter(u => u.role === 'vendor' || u.role === 'admin');
  const filteredVendors = vendorUsers.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    v.email.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    (v.storeName || '').toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const customerUsers = usersList.filter(u => u.role === 'customer');
  const filteredCustomers = customerUsers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 py-3.5 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e40046] to-rose-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">ZAALIMA MASTER CONTROL</h1>
                <span className="bg-yellow-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                  SUPER ADMIN PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-Tenant Dynamic E-Commerce Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {saveSuccessMsg && (
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> {saveSuccessMsg}
              </div>
            )}

            <button
              onClick={refreshAllData}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg border border-slate-700 transition-all no-underline"
            >
              <ExternalLink className="w-3.5 h-3.5 text-yellow-400" /> Go to Shop
            </Link>

            <button
              onClick={() => dispatch(logout())}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main 2-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="md:col-span-3 lg:col-span-3 space-y-4">
          
          {/* Admin Profile Box */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md mx-auto mb-2">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <h3 className="text-sm font-extrabold text-white truncate">{user?.name || 'Super Admin'}</h3>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'superadmin@zaalima.com'}</p>
            <span className="inline-block mt-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Platform Master Admin
            </span>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="bg-slate-950/90 rounded-2xl border border-slate-800 p-2 space-y-1 shadow-xs">
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-yellow-400" />
                <span>Platform Analytics</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('tenants')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'tenants'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Store Tenants</span>
              </div>
              <span className="bg-slate-800 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {storesList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'vendors'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Vendor Listing</span>
              </div>
              <span className="bg-slate-800 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {vendorUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Customer Listing</span>
              </div>
              <span className="bg-slate-800 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {customerUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'permissions'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Admin Permissions</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

          </nav>

          {/* Platform Status Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Server & Database
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">100% DYNAMIC</span>
            </div>
            <p className="text-[10px] text-slate-500">Connected to MongoDB on port 5001. All stores, vendors, customers & permissions synchronized.</p>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT PANEL */}
        <main className="md:col-span-9 lg:col-span-9 space-y-6">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-xs relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</p>
                      <h3 className="text-2xl font-black text-white mt-1">
                        ₹{(summary.totalPlatformRevenue || 0).toLocaleString('en-IN')}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Real-time sales total
                  </p>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-xs relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Orders Processed</p>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {summary.totalPlatformOrders || 0}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-blue-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Live customer orders
                  </p>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-xs relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tenant Stores</p>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {storesList.length}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-purple-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Multi-tenant active
                  </p>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-xs relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</p>
                      <h3 className="text-2xl font-black text-white mt-1">
                        {summary.totalProductsCount || 0}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Synchronized catalog
                  </p>
                </div>

              </div>

              {/* Recharts Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#e40046]" /> Store Revenue Comparison
                      </h3>
                      <p className="text-[11px] text-slate-400">Total earnings across multi-tenant stores</p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    {tenantComparison.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tenantComparison} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="storeName" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                          />
                          <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]}>
                            {tenantComparison.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">
                        No store revenue data recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" /> Platform Revenue Growth
                      </h3>
                      <p className="text-[11px] text-slate-400">Monthly total platform sales trend</p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    {platformTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={platformTrend} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                          <defs>
                            <linearGradient id="superRevDark" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Platform Revenue']}
                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#superRevDark)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500">
                        No order sales trend recorded yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STORE TENANTS */}
          {activeTab === 'tenants' && (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" /> Multi-Tenant Store Directory
                  </h2>
                  <p className="text-xs text-slate-400">Manage registered store database instances live in MongoDB</p>
                </div>

                <button
                  onClick={handleOpenAddStore}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add New Store
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-700 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Store Name & Theme</th>
                      <th className="py-3 px-4">Tenant ID</th>
                      <th className="py-3 px-4">Tagline & Banner</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {storesList.map((store) => (
                      <tr key={store._id || store.tenantId} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                          <div 
                            className="w-3.5 h-3.5 rounded-full border border-slate-600" 
                            style={{ backgroundColor: store.themeColor || '#e40046' }}
                          />
                          <div>
                            <div>{store.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{store.themeColor}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{store.tenantId}</td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          <div className="truncate font-medium">{store.tagline || 'Official Store'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{store.bannerTitle}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            ACTIVE
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => dispatch(setTenantId(store.tenantId))}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                activeTenantId === store.tenantId
                                  ? 'bg-[#e40046] text-white shadow-md'
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                              }`}
                            >
                              {activeTenantId === store.tenantId ? 'Active' : 'Switch'}
                            </button>

                            <button
                              onClick={() => handleOpenEditStore(store)}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-lg transition-colors cursor-pointer"
                              title="Edit Store"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteStore(store.tenantId, store.name)}
                              className="p-1.5 bg-slate-700 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete Store"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VENDOR LISTING */}
          {activeTab === 'vendors' && (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-amber-400" /> Vendor Partner Directory & Listings
                  </h2>
                  <p className="text-xs text-slate-400">Manage store vendors live in MongoDB</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Vendor..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenAddUser('vendor')}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Vendor
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-700 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Vendor Name & Email</th>
                      <th className="py-3 px-4">Store Name & Tenant</th>
                      <th className="py-3 px-4 text-center">Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-amber-400" /> {vendor.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{vendor.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{vendor.storeName || 'MegaStore Partner Store'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{vendor.tenantId || 'tenant-megastore'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            {vendor.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            Verified Vendor
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditUser(vendor)}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-lg transition-colors cursor-pointer"
                              title="Edit Vendor"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(vendor._id, vendor.name)}
                              className="p-1.5 bg-slate-700 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete Vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER LISTING */}
          {activeTab === 'customers' && (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> Customer Account Listings
                  </h2>
                  <p className="text-xs text-slate-400">View and manage registered customers dynamically from MongoDB</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Customer..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    onClick={() => handleOpenAddUser('customer')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Customer
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-400 border-b border-slate-700 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Phone & Location</th>
                      <th className="py-3 px-4 text-center">Total Orders</th>
                      <th className="py-3 px-4 text-right">Total Spent</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredCustomers.map((cust) => (
                      <tr key={cust._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" /> {cust.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{cust.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="text-slate-200 font-semibold">{cust.phone || '+91 9876543210'}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{cust.address || 'Central Delhi, New Delhi'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">
                          {cust.ordersCount || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                          ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-500/30">
                            Verified Customer
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditUser(cust)}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-blue-300 rounded-lg transition-colors cursor-pointer"
                              title="Edit Customer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(cust._id, cust.name)}
                              className="p-1.5 bg-slate-700 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN PERMISSIONS */}
          {activeTab === 'permissions' && (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-purple-400" /> Admin Permissions & Access Control Matrix
                  </h2>
                  <p className="text-xs text-slate-400">Assign granular route permissions dynamically in MongoDB</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border border-slate-700 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950 uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">User Identity</th>
                      <th className="py-3.5 px-4 text-center">Account Role</th>
                      <th className="py-3.5 px-6">Assigned Route & Feature Permissions</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
                    {usersList.map((usr) => {
                      const isSuper = usr.role === 'superadmin';
                      const userPerms = editingPermissions[usr._id] || [];

                      return (
                        <tr key={usr._id} className="hover:bg-slate-700/30 transition-colors">
                          
                          <td className="py-4 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" /> {usr.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{usr.email}</div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                              usr.role === 'superadmin' 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                : usr.role === 'admin' 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : usr.role === 'vendor'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-700 text-slate-300 border-slate-600'
                            }`}>
                              {usr.role}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            {isSuper ? (
                              <div className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-purple-400" />
                                <span>Master Admin Access (All Routes Allowed)</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2.5">
                                {AVAILABLE_PERMISSIONS.map((perm) => {
                                  const isChecked = userPerms.includes(perm.id);
                                  return (
                                    <label
                                      key={perm.id}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                                        isChecked 
                                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleTogglePermission(usr._id, perm.id)}
                                        className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                                      />
                                      <span>{perm.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            {!isSuper && (
                              <button
                                onClick={() => handleSaveUserPermissions(usr._id)}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                              >
                                Save
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* MODAL: ADD / EDIT STORE TENANT */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                {editingStore ? 'Edit Store Configuration' : 'Add New Store Tenant'}
              </h3>
              <button onClick={() => setIsStoreModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urban Style Store"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Fashion & Accessories"
                  value={storeForm.tagline}
                  onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Theme Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={storeForm.themeColor}
                    onChange={(e) => setStoreForm({ ...storeForm, themeColor: e.target.value })}
                    className="w-10 h-9 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={storeForm.themeColor}
                    onChange={(e) => setStoreForm({ ...storeForm, themeColor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Title</label>
                <input
                  type="text"
                  value={storeForm.bannerTitle}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Subtitle</label>
                <input
                  type="text"
                  value={storeForm.bannerSubtitle}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerSubtitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-md"
                >
                  {submitting ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT USER (VENDOR / CUSTOMER) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                {editingUser ? 'Edit User Record' : `Add New ${userForm.role.toUpperCase()} Account`}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor Partner</option>
                  <option value="admin">System Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {userForm.role === 'vendor' && !editingUser && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Associated Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Trendy Outfits Store"
                    value={userForm.storeName}
                    onChange={(e) => setUserForm({ ...userForm, storeName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Address Location</label>
                <input
                  type="text"
                  placeholder="Connaught Place, New Delhi"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-md"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
