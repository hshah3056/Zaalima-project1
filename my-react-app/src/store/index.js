import { configureStore } from '@reduxjs/toolkit';
import tenantReducer from './tenantSlice';
import productReducer from './productSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    products: productReducer,
    cart: cartReducer,
    auth: authReducer
  }
});
