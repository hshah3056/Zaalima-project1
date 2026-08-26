import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCategory, fetchProducts } from '../store/productSlice';
import { Smartphone, Shirt, Sparkles, Home, ChevronRight, Layers, Tag, Grid } from 'lucide-react';

export default function CategorySidebar() {
  const dispatch = useDispatch();
  const { activeTenantId } = useSelector((state) => state.tenant);
  const { categories, selectedCategory } = useSelector((state) => state.products);

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'electronics':
      case 'audio':
      case 'laptops & computers':
      case 'monitors':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case "men's fashion":
      case "women's fashion":
      case 'ethnic wear':
      case 'outerwear':
        return <Shirt className="w-4 h-4 text-pink-600" />;
      case 'home & kitchen':
        return <Home className="w-4 h-4 text-emerald-600" />;
      default:
        return <Tag className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
    dispatch(fetchProducts({ tenantId: activeTenantId, category, search: '' }));
  };

  return (
    <aside className="w-full bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <Grid className="w-4 h-4 text-[#e40046]" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Top Categories</h2>
      </div>

      {/* Category List */}
      <nav className="divide-y divide-gray-100 py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors group ${
                isSelected
                  ? 'bg-red-50 text-[#e40046] font-bold border-l-4 border-[#e40046]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#e40046]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {cat === 'All' ? <Layers className="w-4 h-4 text-[#e40046]" /> : getCategoryIcon(cat)}
                <span>{cat === 'All' ? 'All Products' : cat}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 group-hover:text-[#e40046] transition-transform ${isSelected ? 'translate-x-1 text-[#e40046]' : ''}`} />
            </button>
          );
        })}
      </nav>

      {/* Trust Promo Badge */}
      <div className="m-3 p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded border border-red-100 text-center">
        <Sparkles className="w-5 h-5 text-[#e40046] mx-auto mb-1" />
        <div className="text-xs font-bold text-gray-800">100% Genuine Products</div>
        <div className="text-[10px] text-gray-500 mt-0.5">Directly sourced from verified tenant sellers</div>
      </div>
    </aside>
  );
}
