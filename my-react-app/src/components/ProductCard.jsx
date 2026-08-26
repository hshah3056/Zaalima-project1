import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { Star, ShoppingCart, Tag } from 'lucide-react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  return (
    <div className="product-card bg-white rounded-sm border border-gray-200 overflow-hidden flex flex-col justify-between h-full group">

      {/* Product Image & Badges */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Tag */}
        {product.discount && (
          <span className="absolute top-2 left-2 bg-[#e40046] text-white text-[10px] font-black px-2 py-0.5 rounded-xs shadow">
            {product.discount}
          </span>
        )}

        {/* Deal of the day badge */}
        {product.isDealOfTheDay && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wide flex items-center gap-1 shadow">
            <Tag className="w-3 h-3 fill-black" /> Deal
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            {product.brand || 'Mydeal Brand'}
          </div>

          {/* Name */}
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 hover:text-[#e40046] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 my-2">
            <div className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-extrabold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Delivery Note */}
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Free Delivery Available
          </div>

          {/* Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full mt-3 bg-gray-900 hover:bg-[#e40046] text-white py-2 px-3 rounded-sm text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add To Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
}
