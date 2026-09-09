import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../store/cartSlice';
import { ShieldCheck, ArrowLeft, CreditCard, Truck, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { activeTenantId } = useSelector((state) => state.tenant);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment Modal State for Development/Simulation Mode
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [modalError, setModalError] = useState('');

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5001/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId || '',
        },
        body: JSON.stringify({
          items,
          customerInfo: formData,
          tenantId: activeTenantId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        if (data.url.includes('checkout.stripe.com')) {
          // Live Stripe Checkout URL
          window.location.href = data.url;
        } else {
          // Open interactive Payment Gateway Modal for Dev Mode
          setPaymentSession(data);
          setShowPaymentModal(true);
        }
      } else {
        setErrorMsg(data.message || 'Payment initiation failed. Please check backend connection.');
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      setErrorMsg('Failed to connect to backend server. Make sure port 5001 is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmModalPayment = () => {
    if (cardNumber.endsWith('4000')) {
      setModalError('Your card was declined. Please try another test card (e.g. 4242 4242 4242 4242).');
      return;
    }

    setProcessingPayment(true);
    setModalError('');

    setTimeout(() => {
      setProcessingPayment(false);
      setShowPaymentModal(false);
      if (paymentSession?.url) {
        window.location.href = paymentSession.url;
      } else {
        navigate('/order-success');
      }
    }, 1500);
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

          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded">
              {errorMsg}
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

      {/* STRIPE DEVELOPMENT PAYMENT WINDOW MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="bg-[#635bff] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-wide">Stripe Payment Gateway</h3>
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">TEST DEVELOPMENT MODE</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <p className="text-purple-700 font-semibold">{formData.fullName || 'Customer'}</p>
                  <p className="text-purple-500 text-[11px]">{formData.email || 'customer@example.com'}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-purple-600 font-bold uppercase">Payable Total</span>
                  <span className="text-base font-black text-purple-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {modalError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Credit Card Form Controls */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 flex justify-between">
                    <span>Card Number (Test Card)</span>
                    <span className="text-purple-600 cursor-pointer" onClick={() => setCardNumber('4242 4242 4242 4242')}>Use 4242...</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2.5 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#635bff] outline-none pl-9"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Expiration</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#635bff] outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#635bff] outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Dev Test Options */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Test Outcome Simulation</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardNumber('4242 4242 4242 4242')}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      !cardNumber.endsWith('4000') ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    ✓ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardNumber('4000 0000 0000 4000')}
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded border transition-colors ${
                      cardNumber.endsWith('4000') ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    ✕ Simulate Decline
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleConfirmModalPayment}
                  disabled={processingPayment}
                  className="w-full bg-[#635bff] hover:bg-[#534be0] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {processingPayment ? 'Processing Payment...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} Now`}
                </button>
              </div>

              <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated 256-bit SSL Stripe Test Gateway</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}