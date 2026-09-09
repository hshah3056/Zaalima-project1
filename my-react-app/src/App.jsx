import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VendorDashboard from "./pages/VendorDashboard";
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';

function App() {
  return (
    <>
      <Routes>
        {/* Storefront Home Route */}
        <Route path="/" element={<HomePage />} />

        {/* Vendor Dashboard Route */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Routes>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
    </>
  );
}

export default App;
