import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VendorDashboard from "./pages/VendorDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        {/* Storefront Home Route */}
        <Route path="/" element={<HomePage />} />

        {/* Role-Based Protected Dashboards Routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer', 'superadmin']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* E-Commerce Checkout Flow Routes */}
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
