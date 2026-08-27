import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VendorDashboard from "./pages/VendorDashboard";

function App() {
  return (
    <Routes>
      {/* Storefront Home Route */}
      <Route path="/" element={<HomePage />} />

      {/* Vendor Dashboard Route */}
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
    </Routes>
  );
}

export default App;
