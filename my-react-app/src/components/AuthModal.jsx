import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthModalOpen, loginUser, registerUser, clearError } from '../store/authSlice';
import { X, Lock, Mail, User, Store, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { isAuthModalOpen, loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: ''
  });

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
    dispatch(clearError());
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      dispatch(loginUser({ email: formData.email, password: formData.password }));
    } else {
      dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          storeName: formData.storeName
        })
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 relative">
        
        {/* Header */}
        <div className="bg-[#e40046] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-yellow-300" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Account Sign In</h3>
              <p className="text-[11px] text-white/80">Access your store orders & account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#e40046] border-b-2 border-[#e40046]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#e40046] border-b-2 border-[#e40046]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Registration Role Selector */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 font-bold mb-1.5 uppercase text-[10px]">Select Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-2.5 rounded border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'customer'
                      ? 'bg-red-50 border-[#e40046] text-[#e40046]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" /> Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-2.5 rounded border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'vendor'
                      ? 'bg-red-50 border-[#e40046] text-[#e40046]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-blue-600" /> Vendor Partner
                </button>
              </div>
            </div>
          )}

          {/* Name Field (Register mode) */}
          {mode === 'register' && (
            <div>
              <label className="block text-gray-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Harsh Shah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046]"
                />
              </div>
            </div>
          )}

          {/* Store Name Field (Vendor Register mode) */}
          {mode === 'register' && role === 'vendor' && (
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
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046]"
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
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#e40046]"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="p-2.5 bg-yellow-50 rounded border border-yellow-200 text-[11px] text-yellow-800 space-y-0.5">
            <div className="font-bold">🔑 Test Demo Accounts:</div>
            <div>• Customer: <code>customer@example.com</code> / <code>password123</code></div>
            <div>• Vendor: <code>vendor@example.com</code> / <code>password123</code></div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e40046] hover:bg-[#c7003d] text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider shadow transition-all disabled:opacity-50"
          >
            {loading
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In'
              : `Create ${role === 'vendor' ? 'Vendor' : 'Customer'} Account`}
          </button>
        </form>

      </div>
    </div>
  );
}
