import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { CheckCircle2, ShoppingBag, Mail, ShieldCheck } from 'lucide-react';

export default function OrderSuccessPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Clear cart in Redux once user reaches confirmation
    dispatch(clearCart());

    if (sessionId) {
      setVerifying(true);
      fetch(`http://localhost:5001/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderDetails(data.order);
          }
        })
        .catch((err) => console.error('Failed to verify session:', err))
        .finally(() => setVerifying(false));
    }
  }, [dispatch, sessionId]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-xs">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        Thank you for your purchase. Your payment was processed successfully, and a confirmation email has been dispatched to your email address.
      </p>

      {/* Email confirmation badge */}
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2.5 px-4 rounded-full flex items-center gap-2 mb-5">
        <Mail className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold">Transaction receipt sent to your email inbox</span>
      </div>

      {sessionId && (
        <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-[11px] font-mono text-gray-600 mb-6 break-all w-full">
          Payment Reference ID: {sessionId}
        </div>
      )}

      {orderDetails && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded text-left text-xs w-full mb-6 space-y-1.5">
          <div className="flex justify-between text-gray-700">
            <span>Customer:</span>
            <span className="font-semibold">{orderDetails.customerName}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Email:</span>
            <span className="font-semibold">{orderDetails.customerEmail}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Total Paid:</span>
            <span className="font-bold text-[#e40046]">₹{orderDetails.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 bg-[#e40046] hover:bg-[#c7003d] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider shadow transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  );
}