import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setTenantId } from '../store/tenantSlice';
import { setSearchTerm, fetchProducts } from '../store/productSlice';
import { toggleCartDrawer } from '../store/cartSlice';
import { setAuthModalOpen, logout } from '../store/authSlice';
import { Search, ShoppingCart, MapPin, Building2, User, ChevronDown, Store, LogOut, ShieldCheck } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const { searchTerm, selectedCategory } = useSelector((state) => state.products);
  const { items } = useSelector((state) => state.cart);
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);

  const activeTenant = tenantsList.find((t) => t.tenantId === activeTenantId) || tenantsList[0];
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(searchInput));
    dispatch(fetchProducts({ tenantId: activeTenantId, category: selectedCategory, search: searchInput }));
  };

  const handleTenantChange = (tenantId) => {
    dispatch(setTenantId(tenantId));
    setShowTenantDropdown(false);
    dispatch(fetchProducts({ tenantId, category: 'All', search: '' }));
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Utility Bar */}
      <div className="bg-[#c7003d] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-medium flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Store ID: <strong className="bg-white/20 px-2 py-0.5 rounded text-white">{activeTenantId}</strong>
            </span>
            <span className="hidden md:inline text-white/80">
              India's Premier Online E-Commerce Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#help" className="hover:underline text-white/90">Help Center</a>
            <a href="#orders" className="hover:underline text-white/90">Track Order</a>
          </div>
        </div>
      </div>

      {/* Main mydeal Header Bar */}
      <div className="bg-[#e40046] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo & Tenant Brand */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white italic font-serif flex items-center gap-1">
                E-portal <span className="text-yellow-300 not-italic text-xs bg-black/20 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider">Mydeal</span>
              </span>
              <span className="text-[10px] text-white/90 truncate max-w-[180px]">
                {activeTenant?.name || 'Mydeal Store'}
              </span>
            </div>
          </div>

          {/* Search Bar with Category Dropdown */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl flex items-center bg-white rounded-sm overflow-hidden shadow-inner">
            <input
              type="text"
              placeholder="Search products, brands and categories..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 text-sm text-gray-800 focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#2b2b2b] hover:bg-black text-white px-6 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right Actions: Tenant Switcher, Cart, Account */}
          <div className="flex items-center gap-5">

            {/* Dynamic Multi-Tenant Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs font-semibold border border-white/30 transition-all"
                title="Switch Multi-Tenant Database Store"
              >
                <Building2 className="w-4 h-4 text-yellow-300" />
                <div className="text-left hidden lg:block">
                  <div className="text-[9px] uppercase tracking-wider text-yellow-200">Switch Store</div>
                  <div className="text-xs font-bold truncate max-w-[110px]">{activeTenant?.name}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/80" />
              </button>

              {/* Dropdown Menu */}
              {showTenantDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-md shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Select Tenant Store
                  </div>
                  {tenantsList.map((tenant) => (
                    <button
                      key={tenant.tenantId}
                      onClick={() => handleTenantChange(tenant.tenantId)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-red-50 transition-colors ${activeTenantId === tenant.tenantId ? 'bg-red-50 font-bold text-[#e40046] border-l-4 border-[#e40046]' : 'text-gray-700'
                        }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">{tenant.name}</div>
                        <div className="text-[10px] text-gray-500">{tenant.tagline}</div>
                      </div>
                      {activeTenantId === tenant.tenantId && (
                        <span className="bg-[#e40046] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Location Pincode */}
            <div className="hidden xl:flex items-center gap-1 text-xs text-white/90 border-r border-white/20 pr-4">
              <MapPin className="w-4 h-4 text-yellow-300" />
              <div>
                <div className="text-[10px] text-white/70">Deliver to</div>
                <div className="font-bold">110001 (New Delhi)</div>
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative flex items-center gap-2 bg-white text-[#e40046] hover:bg-yellow-100 font-bold px-3.5 py-2 rounded-sm text-sm shadow transition-all"
            >
              <ShoppingCart className="w-5 h-5 text-[#e40046]" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Status & Vendor Dashboard Link */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/vendor/dashboard"
                  className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-2.5 py-1.5 rounded shadow transition-all uppercase tracking-wider"
                  title="Open Vendor Dashboard"
                >
                  <ShieldCheck className="w-3.5 h-3.5 fill-black" />
                  <span className="hidden sm:inline">Vendor Dashboard</span>
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="p-1.5 bg-black/30 hover:bg-black/50 rounded text-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/vendor/dashboard"
                  className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-2 py-1.5 rounded shadow transition-all uppercase tracking-wider text-[11px]"
                  title="Open Vendor Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 fill-black" />
                  <span className="hidden md:inline">Vendor Portal</span>
                </Link>
                <button
                  onClick={() => dispatch(setAuthModalOpen(true))}
                  className="flex items-center gap-1.5 text-xs hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded border border-white/30 transition-all font-semibold"
                >
                  <User className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[9px] text-white/80 uppercase">Account</div>
                    <div className="font-bold leading-none">Sign In</div>
                  </div>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}