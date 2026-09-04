import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Truck,
  Tag
} from 'lucide-react';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const activeTenant = tenantsList?.find((t) => t.tenantId === activeTenantId) || tenantsList?.[0];

  // Dynamic calculations matching store logic
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalOriginal = items.reduce(
    (total, item) => total + (item.originalPrice || item.price) * item.quantity, 
    0
  );
  const totalSavings = totalOriginal - subtotal;
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 49 : 0;
  const grandTotal = subtotal + deliveryCharge;
  const totalItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout', {
      state: {
        items,
        subtotal,
        deliveryCharge,
        grandTotal,
        totalSavings,
        tenantId: activeTenantId,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Looks like you haven't added anything yet. Explore our store and discover items to add!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#e40046] hover:bg-[#c7003d] text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Shopping Cart
            <span className="text-sm font-semibold text-gray-500">
              ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
            </span>
          </h1>
          {activeTenant && (
            <p className="text-xs text-gray-500 mt-1">
              Store: <strong className="text-gray-700">{activeTenant.name}</strong>
            </p>
          )}
        </div>

        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs text-red-600 hover:text-red-700 font-semibold self-start sm:self-auto"
        >
          Clear All Items
        </button>
      </div>

      {/* Main Grid: Items List + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Product Table */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemBasePrice = item.price;
            const itemOriginalPrice = item.originalPrice || item.price;
            const itemRowTotal = itemBasePrice * item.quantity;
            const itemSavings = (itemOriginalPrice - itemBasePrice) * item.quantity;

            return (
              <div
                key={item._id}
                className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Image & Basic Details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-contain bg-gray-50 rounded-md border border-gray-100 p-2 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    
                    {/* Unit Price info */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        ₹{itemBasePrice.toLocaleString('en-IN')}
                      </span>
                      {itemOriginalPrice > itemBasePrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{itemOriginalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {itemSavings > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                        <Tag className="w-3 h-3" /> Save ₹{itemSavings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }));
                        } else {
                          dispatch(removeFromCart(item._id));
                        }
                      }}
                      className="w-8 h-8 bg-gray-50 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                      title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="w-10 text-center text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))
                      }
                      className="w-8 h-8 bg-gray-50 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Calculated Row Total */}
                  <div className="text-right min-w-[90px]">
                    <div className="text-base font-black text-gray-900">
                      ₹{itemRowTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      ₹{itemBasePrice} × {item.quantity}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                    title="Remove from Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#e40046] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </div>
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-5 sticky top-6">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({totalItemsCount}):</span>
              <span className="font-bold text-gray-800">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Discount / Savings:</span>
                <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 items-center">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                Delivery Fee:
              </span>
              <span className="font-bold">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-600 uppercase font-extrabold text-[11px]">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>

            {deliveryCharge > 0 && (
              <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
                Add ₹{(500 - subtotal).toLocaleString('en-IN')} more to get <strong>FREE delivery</strong>!
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-black text-gray-900 block">Grand Total:</span>
              <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
            </div>
            <span className="text-xl font-black text-[#e40046]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="w-full bg-[#e40046] hover:bg-[#c7003d] text-white py-3.5 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Safe & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}