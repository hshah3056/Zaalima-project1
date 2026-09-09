import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import { setAuthModalOpen, logout } from '../store/authSlice';
import { ShieldCheck, ArrowLeft, CreditCard, Truck, X, Lock, CheckCircle2, AlertCircle, User, LogIn, ShieldAlert } from 'lucide-react';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { activeTenantId } = useSelector((state) => state.tenant);
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!isAuthenticated || !token || role !== 'customer') {
      if (role && role !== 'customer') {
        setErrorMsg(`Only Customer accounts can place shopping orders. You are signed in as '${role}'. Please sign in with a Customer account.`);
      } else {
        setErrorMsg('Please sign in with a Customer account to place your order.');
      }
      dispatch(setAuthModalOpen(true));
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://127.0.0.1:5001/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId || '',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          customerInfo: formData,
          tenantId: activeTenantId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Direct seamless redirect to official Stripe Checkout session
        window.location.href = data.url;
      } else {
        setErrorMsg(data.message || 'Payment initiation failed. Only Customer accounts can place orders.');
        if (response.status === 401 || response.status === 403) {
          dispatch(setAuthModalOpen(true));
        }
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      setErrorMsg('Failed to connect to backend server. Make sure port 5001 is running.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No items to checkout</h2>
        <p className="text-gray-500 mb-6 text-sm">Please add items to your cart first.</p>
        <Link
          to="/"
          className="bg-[#e40046] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  // GATE 1: Unauthenticated User - Prompt Customer Sign In
  if (!isAuthenticated || !localStorage.getItem('token')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-[#e40046] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="bg-rose-100 text-[#e40046] text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              STEP 1: CUSTOMER SIGN IN REQUIRED
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">Sign In Required to Proceed</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Please sign in with your customer account before continuing to shipping details and payment options.
            </p>
          </div>

          {/* Order Summary Teaser */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold text-gray-800">
              <span>Cart Summary ({items.reduce((t, i) => t + i.quantity, 0)} Items)</span>
              <span className="text-[#e40046] font-black text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {items.map((i) => i.name).join(', ')}
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => dispatch(setAuthModalOpen(true))}
              className="w-full sm:w-auto bg-[#e40046] hover:bg-[#c7003d] text-white font-extrabold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In / Register Customer Account
            </button>
            
            <Link
              to="/cart"
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure checkout protected by Customer Authorization</span>
          </div>
        </div>
      </div>
    );
  }

  // GATE 2: Non-Customer Role (Vendor, Admin, Super Admin) - Block Checkout Next Step
  if (role !== 'customer') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              CUSTOMER ROLE REQUIRED
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">Customer Account Required to Place Order</h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
              You are currently signed in as <strong className="uppercase text-amber-800">{role}</strong>. Shopping orders can only be placed by Customer accounts.
            </p>
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center font-bold text-gray-800">
              <span>Cart Total ({items.reduce((t, i) => t + i.quantity, 0)} Items)</span>
              <span className="text-[#e40046] font-black text-sm">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {items.map((i) => i.name).join(', ')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                dispatch(setAuthModalOpen(true));
              }}
              className="w-full sm:w-auto bg-[#e40046] hover:bg-[#c7003d] text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Switch to Customer Account
            </button>

            <Link
              to={role === 'superadmin' ? '/super-admin/dashboard' : '/vendor/dashboard'}
              className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
            >
              Go to {role === 'superadmin' ? 'Super Admin Portal' : 'Vendor Dashboard'}
            </Link>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Role-Based Order Protection Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e40046]">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="text-2xl font-black text-gray-900 mt-2">Checkout & Shipping</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#e40046]" /> Shipping Details
          </h2>

          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold block">Sign In Required</span>
                  <span className="text-amber-700">You must be logged into your customer account to place an order.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(setAuthModalOpen(true))}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <LogIn className="w-4 h-4" /> Sign In / Register
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                placeholder="110001"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat / House No., Street, Landmark"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="New Delhi"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Delhi"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#e40046] outline-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e40046] hover:bg-[#c7003d] text-white py-3.5 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {loading ? 'Processing Order...' : `Proceed to Pay ₹${grandTotal.toLocaleString('en-IN')}`}
            </button>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-200">
            Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
          </h3>

          <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded bg-white border border-gray-200 p-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-gray-500 text-[10px]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-gray-200 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery:</span>
              <span className="font-bold text-emerald-600">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
              <span>Payable Amount:</span>
              <span className="text-[#e40046]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted 256-bit SSL transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}