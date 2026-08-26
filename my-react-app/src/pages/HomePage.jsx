import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTenants } from '../store/tenantSlice';
import { fetchProducts } from '../store/productSlice';

import Header from '../components/Header';
import CategorySidebar from '../components/CategorySidebar';
import HeroBanner from '../components/HeroBanner';
import DealsSection from '../components/DealsSection';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';

export default function HomePage() {
  const dispatch = useDispatch();
  const { activeTenantId } = useSelector((state) => state.tenant);
  const { selectedCategory, searchTerm } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchTenants());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ tenantId: activeTenantId, category: selectedCategory, search: searchTerm }));
  }, [dispatch, activeTenantId, selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      
      {/* Top Header */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 space-y-4">
        
        {/* Upper Layout: 12-Column Grid (3-Col Category Sidebar + 9-Col Hero Banner Slider) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-3 h-full">
            <CategorySidebar />
          </div>
          <div className="lg:col-span-9 h-full">
            <HeroBanner />
          </div>
        </div>

        {/* Flash Sale Deals Section */}
        <DealsSection />

        {/* Multi-Tenant Products Grid */}
        <ProductGrid />

      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Login & Registration RBAC Modal */}
      <AuthModal />

      {/* Footer */}
      <Footer />

    </div>
  );
}
