import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout, updateUserProfile } from '../store/authSlice';
import { 
  ShoppingBag, User, MapPin, Settings, LogOut, ArrowLeft, 
  CheckCircle2, Clock, Truck, ShieldCheck, RefreshCw, ChevronRight, Package,
  Search, Filter, X, FileText, Printer, ChevronLeft, CreditCard, Eye, Save
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5001/api';

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile Form Controlled State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '+91 9876543210');
  const [profileAddress, setProfileAddress] = useState(user?.address || 'Connaught Place, Central Delhi, New Delhi - 110001');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '+91 9876543210');
      setProfileAddress(user.address || 'Connaught Place, Central Delhi, New Delhi - 110001');
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      await dispatch(updateUserProfile({ name: profileName, phone: profilePhone, address: profileAddress })).unwrap();
      setProfileMessage({ type: 'success', text: 'Customer profile updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: typeof err === 'string' ? err : 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const fetchCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.data?.data) {
        setOrders(res.data.data);
      } else if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Failed to fetch customer orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      String(order._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items || []).some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (order.status || 'completed').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-rose-50/30 text-gray-800">
      
      {/* Customer Top Bar */}
      <header className="bg-white border-b border-rose-100 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 no-underline text-gray-900 font-serif italic text-xl font-black">
              E-portal <span className="not-italic text-xs bg-[#e40046] text-white px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider">Mydeal</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">Customer Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all no-underline"
            >
              <ArrowLeft className="w-4 h-4 text-yellow-400" /> Back to Store
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-1.5 text-xs text-rose-600 font-bold hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-rose-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Left Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-4">
            
            {/* Customer Profile Card */}
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e40046] to-rose-400 text-white flex items-center justify-center font-black text-2xl shadow-md mx-auto mb-3">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <h2 className="text-base font-extrabold text-gray-900 truncate">{user?.name || 'Valued Customer'}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'customer@example.com'}</p>
              <span className="inline-block mt-2 bg-rose-50 text-[#e40046] border border-rose-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Customer Account
              </span>
            </div>

            {/* Sidebar Navigation Menu */}
            <nav className="bg-white rounded-2xl border border-rose-100 shadow-xs overflow-hidden p-2 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#e40046] text-white shadow-md'
                    : 'text-gray-700 hover:bg-rose-50/70 hover:text-[#e40046]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-rose-100 text-[#e40046]'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-[#e40046] text-white shadow-md'
                    : 'text-gray-700 hover:bg-rose-50/70 hover:text-[#e40046]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>My Address</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#e40046] text-white shadow-md'
                    : 'text-gray-700 hover:bg-rose-50/70 hover:text-[#e40046]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </nav>

            {/* Quick Support / Info Box */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-4 rounded-2xl border border-rose-100 text-xs text-gray-600">
              <p className="font-bold text-gray-900">Need Help with Orders?</p>
              <p className="text-[11px] text-gray-500 mt-1">Our support team is available 24/7 to assist with trackings and returns.</p>
              <a href="#help" className="inline-block mt-2 text-[#e40046] font-bold text-[11px] hover:underline">
                Contact Support →
              </a>
            </div>

          </aside>

          {/* Right Main Content Area */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{orders.length}</h3>
                </div>
                <div className="p-3 bg-rose-50 text-[#e40046] rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Amount Spent</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totalSpent.toLocaleString('en-IN')}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                  <h3 className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Verified Customer
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* TAB CONTENT 1: MY ORDERS WITH SEARCH, FILTER & PAGINATION */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-6 space-y-6">
                
                {/* Header & Refresh */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#e40046]" /> My Orders & Purchase History
                    </h2>
                    <p className="text-xs text-gray-500">Track current shipments, filter history, and view order receipts</p>
                  </div>
                  <button
                    onClick={fetchCustomerOrders}
                    className="text-xs text-[#e40046] font-bold hover:underline flex items-center gap-1 cursor-pointer bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                {/* Filter and Search Bar Control Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  
                  {/* Search Bar Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Order ID or Product..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#e40046] text-gray-800"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Dropdown Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Filter Status:</span>
                    <select
                      value={statusFilter}
                      onChange={handleStatusChange}
                      className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-800 focus:outline-none focus:border-[#e40046] cursor-pointer"
                    >
                      <option value="all">All Orders</option>
                      <option value="completed">Completed</option>
                      <option value="processing">Processing</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                </div>

                {/* Orders List / Empty State */}
                {paginatedOrders.length === 0 ? (
                  <div className="py-16 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-bold text-gray-700">No matching orders found</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try clearing your search query or status filter to see all orders.'
                        : 'Discover great deals and place your first order from our catalog.'}
                    </p>
                    {(searchQuery || statusFilter !== 'all') ? (
                      <button
                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }}
                        className="mt-4 inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <Link
                        to="/"
                        className="mt-5 inline-flex items-center gap-2 bg-[#e40046] hover:bg-[#c7003d] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md no-underline transition-all"
                      >
                        Browse Store Catalog →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 hover:border-rose-300 bg-white rounded-xl p-5 transition-all shadow-2xs hover:shadow-md space-y-4"
                      >
                        {/* Card Top Strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 text-gray-800 font-mono font-bold px-2.5 py-1 rounded">
                              #{String(order._id).slice(-8)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 font-medium">
                              {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                              order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              order.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status || 'Completed'}
                            </span>
                            <span className="font-black text-gray-900 text-base">
                              ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="divide-y divide-gray-100">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-50 rounded-lg border border-rose-100 flex items-center justify-center text-xs font-black text-[#e40046] shrink-0">
                                  {item.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">{item.name}</p>
                                  <p className="text-[11px] text-gray-400">Qty: {item.quantity || 1}</p>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900">
                                ₹{(Number(item.price) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Card Bottom Strip with View Details Button */}
                        <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-xs">
                              Address: <strong>{order.shippingAddress || 'Default Address'}</strong>
                            </span>
                          </div>
                          
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center justify-center gap-1.5 bg-[#e40046] hover:bg-[#c7003d] text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-xs cursor-pointer no-underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> Order Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredOrders.length > itemsPerPage && (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
                    <p className="text-gray-500">
                      Showing <strong className="text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-gray-800">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong className="text-gray-800">{filteredOrders.length}</strong> orders
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <span className="font-bold text-gray-800 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT 2: MY ADDRESS */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#e40046]" /> My Saved Shipping Addresses
                    </h2>
                    <p className="text-xs text-gray-500">Manage delivery locations for fast single-click checkouts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="text-xs bg-[#e40046] hover:bg-[#c7003d] text-white font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Edit Primary Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-[#e40046] bg-rose-50/20 p-5 rounded-2xl text-xs space-y-2 relative">
                    <span className="bg-[#e40046] text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full">
                      Default Shipping Address
                    </span>
                    <h3 className="font-black text-gray-900 text-sm pt-1">{user?.name || 'Customer'}</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">
                      {profileAddress || 'Connaught Place, Central Delhi, New Delhi - 110001'}
                    </p>
                    <p className="text-gray-500 font-medium pt-1">Phone: {profilePhone || '+91 9876543210'}</p>
                  </div>

                  <div className="border border-dashed border-gray-300 p-6 rounded-2xl text-center flex flex-col items-center justify-center text-gray-400 hover:border-rose-400 hover:bg-rose-50/30 transition-all cursor-pointer">
                    <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-bold text-gray-600">Add Alternate Address</p>
                    <p className="text-[11px] text-gray-400">Office, Home, or Family addresses</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl border border-rose-100 shadow-xs p-6 space-y-5">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#e40046]" /> My Profile & Personal Details
                  </h2>
                  <p className="text-xs text-gray-500">View and update your personal account information and default delivery location</p>
                </div>

                {profileMessage && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
                    profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{profileMessage.text}</span>
                    </div>
                    <button onClick={() => setProfileMessage(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form className="max-w-xl space-y-4 text-xs" onSubmit={handleProfileSave}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 font-bold mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#e40046] focus:ring-1 focus:ring-[#e40046] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-bold mb-1.5">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 font-bold mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#e40046] focus:ring-1 focus:ring-[#e40046] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-bold mb-1.5">Account Role</label>
                      <input
                        type="text"
                        disabled
                        value={user?.role?.toUpperCase() || 'CUSTOMER'}
                        className="w-full px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl font-black text-[#e40046] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-bold mb-1.5">Default Shipping Address</label>
                    <textarea
                      rows={2}
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Street, City, Pincode..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#e40046] focus:ring-1 focus:ring-[#e40046] transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 bg-[#e40046] hover:bg-[#c7003d] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{profileSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* PROFESSIONAL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 flex items-center justify-between border-b border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-base font-black tracking-tight">
                    Order Details #{String(selectedOrder._id).slice(-8)}
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Order Status Stepper Timeline */}
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-800">Order Progress Tracking</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {selectedOrder.status || 'Completed'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-gray-800 text-[11px]">Placed</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-gray-800 text-[11px]">Processed</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-gray-800 text-[11px]">Shipped</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="font-bold text-gray-800 text-[11px]">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Itemized Purchased Products List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-wider text-gray-500">
                    Ordered Products ({selectedOrder.items?.length || 0})
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Itemized Summary</span>
                </div>

                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Product Image Thumbnail or Badge */}
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-[#e40046] text-white rounded-lg flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                            {item.name?.charAt(0) || 'P'}
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-gray-900 text-sm">{item.name}</p>
                            <span className="bg-rose-100 text-[#e40046] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              Verified Item
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                            <span>Unit Price: <strong>₹{Number(item.price).toLocaleString('en-IN')}</strong></span>
                            <span>•</span>
                            <span>Quantity: <strong className="text-gray-800">×{item.quantity || 1}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Item Total & View Product Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                        <span className="font-black text-gray-900 text-sm">
                          ₹{(Number(item.price) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                        
                        <Link
                          to="/"
                          onClick={() => setSelectedOrder(null)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e40046] hover:underline no-underline"
                        >
                          <span>View in Shop</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Payment Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <MapPin className="w-4 h-4 text-[#e40046]" /> Delivery Address
                  </div>
                  <p className="text-gray-600 font-semibold">{selectedOrder.shippingAddress || 'Default Address'}</p>
                  <p className="text-gray-400 text-[11px]">Deliver via Express Courier Service</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Status
                  </div>
                  <p className="text-gray-600 font-semibold">Online Credit / Stripe Payment</p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Paid & Confirmed
                  </span>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="bg-gray-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal Amount:</span>
                  <span>₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Standard Express Shipping:</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Estimated Taxes (Included):</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between font-black text-sm text-yellow-400 border-t border-gray-800 pt-2 mt-2">
                  <span>Grand Total Paid:</span>
                  <span>₹{(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer with Receipt Print Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-500 text-[11px]">Transaction confirmation email sent to registered inbox.</span>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-400" /> Print Order Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
