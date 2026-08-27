import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { PackageOpen, Sparkles, Filter } from 'lucide-react';

export default function ProductGrid() {
  const { items, selectedCategory, loading, error } = useSelector((state) => state.products);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const activeTenant = tenantsList.find((t) => t.tenantId === activeTenantId) || tenantsList[0];

  return (
    <section id="products" className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
      
      {/* Category Title & Tenant Info Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#e40046]" />
          <h2 className="text-base font-extrabold text-gray-900">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length} Items
          </span>
        </div>

        {/* Active Store Badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded border border-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Store: <strong className="text-gray-800 font-bold">{activeTenant?.name}</strong></span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse py-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-100 h-72 rounded-sm border border-gray-200" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-sm border border-red-100 my-4 text-xs font-semibold">
          Error loading products: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          <PackageOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No Products Found</h3>
          <p className="text-xs text-gray-400 mt-1">There are no items in this category for the selected tenant store.</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </section>
  );
}
