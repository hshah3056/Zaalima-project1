import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAuthModalOpen, loginUser, registerUser, clearError } from '../store/authSlice';
import { X, Lock, Mail, User, Store, ShieldCheck, LogIn, UserPlus, Key, Shield, AlertCircle } from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isCheckoutPage = location.pathname === '/checkout';

  const { isAuthModalOpen, loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'admin' | 'superadmin'
  const [formData, setFormData] = useState({
    name: '',
    email: 'hshah3056@gmail.com',
    password: 'password123',
    storeName: ''
  });

  // Force customer role if opened on checkout page
  useEffect(() => {
    if (isCheckoutPage) {
      setRole('customer');
    }
  }, [isCheckoutPage, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
    dispatch(clearError());
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    dispatch(clearError());
  };

  const handleQuickDemoFill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'superadmin') {
      setFormData({ name: 'Platform Super Admin', email: 'superadmin@zaalima.com', password: 'password123', storeName: '' });
    } else if (selectedRole === 'admin') {
      setFormData({ name: 'System Admin', email: 'admin@zaalima.com', password: 'password123', storeName: '' });
    } else if (selectedRole === 'vendor') {
      setFormData({ name: 'Vendor Partner', email: 'vendor@zaalima.com', password: 'password123', storeName: 'Shah Electronics' });
    } else {
      setFormData({ name: 'Customer Account', email: 'hshah3056@gmail.com', password: 'password123', storeName: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let action;
    const targetRole = isCheckoutPage ? 'customer' : role;

    if (mode === 'login') {
      action = await dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      action = await dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: targetRole,
          storeName: formData.storeName
        })
      );
    }

    if (action.meta.requestStatus === 'fulfilled') {
      const userRole = action.payload.user?.role || targetRole;
      if (userRole === 'superadmin') {
        navigate('/super-admin/dashboard');
      } else if (userRole === 'vendor' || userRole === 'admin') {
        navigate('/vendor/dashboard');
      } else {
        if (isCheckoutPage) {
          dispatch(setAuthModalOpen(false));
          navigate('/checkout');
        } else {
          navigate('/customer/dashboard');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 relative">

        {/* Header */}
        <div className="bg-[#111827] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e40046] flex items-center justify-center font-bold text-white text-sm shadow">
              Z
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide">
                {isCheckoutPage ? 'Customer Account Sign In' : 'Role-Based Account Authentication'}
              </h3>
              <p className="text-[10px] text-gray-400">
                {isCheckoutPage 
                  ? 'Required to proceed with checkout & shipping' 
                  : 'Customer, Vendor, Admin & Super Admin Access'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Login vs Register) */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${mode === 'login'
              ? 'bg-white text-[#e40046] border-b-2 border-[#e40046]'
              : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${mode === 'register'
              ? 'bg-white text-[#e40046] border-b-2 border-[#e40046]'
              : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            <UserPlus className="w-4 h-4" /> Create Customer Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Notice Banner on Checkout Page */}
          {isCheckoutPage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[11px] font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#e40046] shrink-0" />
              <span>Customer Sign In Only: Vendor & Admin login options are hidden during checkout.</span>
            </div>
          )}

          {/* Quick Demo Role Selector Buttons (HIDDEN DURING CHECKOUT) */}
          {!isCheckoutPage ? (
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                1-Click Select Demo Role Credentials:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('customer')}
                  className={`py-2 px-1 rounded border text-center transition-all cursor-pointer ${role === 'customer' ? 'bg-rose-50 border-[#e40046] text-[#e40046]' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('vendor')}
                  className={`py-2 px-1 rounded border text-center transition-all cursor-pointer ${role === 'vendor' ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  🏪 Vendor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('admin')}
                  className={`py-2 px-1 rounded border text-center transition-all cursor-pointer ${role === 'admin' ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('superadmin')}
                  className={`py-2 px-1 rounded border text-center transition-all cursor-pointer ${role === 'superadmin' ? 'bg-purple-50 border-purple-600 text-purple-900' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  👑 SuperAdmin
                </button>
              </div>
            </div>
          ) : (
            /* Locked Customer Role Badge during Checkout */
            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#e40046]" /> Account Type:
              </span>
              <span className="bg-rose-100 text-[#e40046] font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full">
                CUSTOMER ACCOUNT
              </span>
            </div>
          )}

          {/* Registration Full Name */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046]"
                />
              </div>
            </div>
          )}

          {/* Store Name for Vendor Registration (ONLY SHOWN IF NON-CHECKOUT VENDOR MODE) */}
          {mode === 'register' && role === 'vendor' && !isCheckoutPage && (
            <div>
              <label className="block text-gray-700 font-bold mb-1">Store / Brand Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Shah Electronics"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046]"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046] font-mono text-xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046] font-mono text-xs"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111827] hover:bg-black text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Authenticating Account...'
              : mode === 'login'
                ? isCheckoutPage ? 'Sign In as Customer' : `Sign In as ${role.toUpperCase()}`
                : isCheckoutPage ? 'Create Customer Account' : `Create ${role.toUpperCase()} Account`}
          </button>
        </form>

      </div>
    </div>
  );
}
