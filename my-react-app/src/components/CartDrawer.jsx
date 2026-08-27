import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart, setCartOpen } from '../store/cartSlice';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { items, isCartOpen } = useSelector((state) => state.cart);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const activeTenant = tenantsList.find((t) => t.tenantId === activeTenantId) || tenantsList[0];

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalOriginal = items.reduce((total, item) => total + (item.originalPrice || item.price) * item.quantity, 0);
  const totalSavings = totalOriginal - subtotal;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image
          })),
          totalAmount: subtotal,
          customerName: 'Harsh Shah',
          customerEmail: 'harsh@example.com'
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrderPlaced(true);
        dispatch(clearCart());
      }
    } catch (err) {
      console.warn('Backend server offline, order processed locally:', err.message);
      setOrderPlaced(true);
      dispatch(clearCart());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(setCartOpen(false));
    setOrderPlaced(false);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="bg-[#e40046] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold">Shopping Cart</h2>
              <div className="text-[10px] text-white/80">Tenant: {activeTenant?.name}</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Order Placed Success View */}
        {orderPlaced ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
            <p className="text-xs text-gray-500 mb-6">
              Your order has been successfully placed with <strong>{activeTenant?.name}</strong>!
            </p>
            <button
              onClick={handleClose}
              className="bg-[#e40046] text-white px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider shadow"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Browse products and add them to your cart.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item._id} className="py-3 flex gap-3 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain bg-gray-50 rounded border border-gray-100 p-1"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</h4>
                      <div className="text-xs font-bold text-gray-900 mt-0.5">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Price Calculation */}
            {items.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-bold text-gray-800">{items.reduce((t, i) => t + i.quantity, 0)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Total Savings:</span>
                      <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Payable Amount:</span>
                    <span className="text-[#e40046]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-[#e40046] hover:bg-[#c7003d] text-white py-3 rounded-sm font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
