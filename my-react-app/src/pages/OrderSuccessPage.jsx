import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart in Redux once user reaches confirmation
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        Thank you for your order. Your payment was processed successfully and your items are being prepared for dispatch.
      </p>

      {sessionId && (
        <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-[11px] font-mono text-gray-600 mb-6 break-all">
          Payment Reference ID: {sessionId.slice(0, 24)}...
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