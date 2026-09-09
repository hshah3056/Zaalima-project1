import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart, setCartOpen } from '../store/cartSlice';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

import { setAuthModalOpen } from '../store/authSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, isCartOpen } = useSelector((state) => state.cart);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const activeTenant = tenantsList.find((t) => t.tenantId === activeTenantId) || tenantsList[0];

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalOriginal = items.reduce((total, item) => total + (item.originalPrice || item.price) * item.quantity, 0);
  const totalSavings = totalOriginal - subtotal;
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleClose = () => {
    dispatch(setCartOpen(false));
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    dispatch(setCartOpen(false));
    if (!isAuthenticated || !localStorage.getItem('token')) {
      dispatch(setAuthModalOpen(true));
    }
    navigate('/checkout');
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
              <div className="text-[10px] text-white/80">Store: {activeTenant?.name}</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

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
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
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
              <div className="flex justify-between">
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

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#e40046] hover:bg-[#c7003d] text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
