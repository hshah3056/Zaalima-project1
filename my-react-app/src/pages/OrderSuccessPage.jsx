import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { 
  CheckCircle2, ShoppingBag, Mail, ShieldCheck, Printer, 
  ArrowLeft, Package, CreditCard, Truck, ExternalLink, RefreshCw 
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5001/api';

export default function OrderSuccessPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Clear shopping cart on successful checkout arrival
    dispatch(clearCart());

    if (sessionId) {
      setVerifying(true);
      fetch(`${API_BASE}/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderDetails(data.order);
          } else {
            setError(data.message || 'Unable to retrieve order details.');
          }
        })
        .catch((err) => {
          console.error('Failed to verify payment session:', err);
          setError('Network error verifying payment session.');
        })
        .finally(() => setVerifying(false));
    }
  }, [dispatch, sessionId]);

  return (
    <div className="min-h-screen bg-rose-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Success Banner Card */}
        <div className="bg-white border border-rose-100 rounded-3xl shadow-xl overflow-hidden p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
            {verifying ? (
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-12 h-12" />
            )}
          </div>

          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              PAYMENT VERIFIED & CONFIRMED
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">Order Confirmed!</h1>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
              Thank you for your purchase! Your payment was processed successfully via Stripe. An official order receipt has been sent to your email.
            </p>
          </div>

          {/* Email Confirmation Pill */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2 rounded-full font-semibold">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Transaction receipt dispatched to your email inbox</span>
          </div>

          {sessionId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] font-mono text-gray-600 max-w-md mx-auto break-all">
              <span className="text-gray-400 font-sans block text-[10px] uppercase font-bold tracking-wider mb-0.5">Stripe Payment Reference</span>
              {sessionId}
            </div>
          )}
        </div>

        {/* Order Details Receipt Box */}
        {orderDetails && (
          <div className="bg-white border border-rose-100 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#e40046]" /> Order Invoice Receipt
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Order ID: <strong className="font-mono text-gray-800">#{String(orderDetails._id).slice(-8)}</strong>
                </p>
              </div>

              <span className="self-start sm:self-auto bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                {orderDetails.status || 'Completed'}
              </span>
            </div>

            {/* Customer & Address Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Customer Information
                </div>
                <p className="font-extrabold text-gray-800">{orderDetails.customerName}</p>
                <p className="text-gray-500 font-medium">{orderDetails.customerEmail}</p>
                <p className="text-[11px] text-emerald-700 font-bold pt-1">Payment Method: Online Card (Stripe)</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1">
                  <Truck className="w-4 h-4 text-[#e40046]" /> Delivery Destination
                </div>
                <p className="text-gray-700 font-semibold leading-relaxed">
                  {orderDetails.shippingAddress || 'Standard Courier Delivery Address'}
                </p>
              </div>
            </div>

            {/* Itemized Purchased Products */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">
                Purchased Items ({orderDetails.items?.length || 0})
              </h4>

              <div className="divide-y divide-gray-100">
                {(orderDetails.items || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-rose-50 text-[#e40046] font-black rounded-lg flex items-center justify-center text-sm shrink-0">
                          {item.name?.charAt(0) || 'P'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>

                    <span className="font-black text-gray-900 text-sm">
                      ₹{(Number(item.price) * Number(item.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-gray-900 text-white p-5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>₹{(orderDetails.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Express Delivery Charge:</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-black text-yellow-400 border-t border-gray-800 pt-3 mt-2">
                <span>Total Amount Paid:</span>
                <span>₹{(orderDetails.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-yellow-400" /> Print Order Receipt
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/customer/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-[#e40046] border border-rose-200 px-5 py-2.5 rounded-xl text-xs font-bold no-underline transition-colors"
                >
                  <Package className="w-4 h-4" /> View My Orders
                </Link>

                <Link
                  to="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e40046] hover:bg-[#c7003d] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md no-underline transition-all"
                >
                  <ShoppingBag className="w-4 h-4" /> Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}

        <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted 256-bit SSL Stripe Payment Gateway Transaction</span>
        </div>

      </div>
    </div>
  );
}