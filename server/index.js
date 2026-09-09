import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { runSeed } from './seed.js';

dotenv.config();

const app = express();
app.use(cors());

// Stripe Webhook requires raw request body for signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);


app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Zaalima E-Commerce Multi-Tenant API',
    endpoints: {
      health: '/health',
      auth: '/api/auth (register, login, me)',
      stores: '/api/stores',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      seed: '/api/seed (POST)'
    }
  });
});

app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(200).json({
    status: 'ok',
    message: 'Backend API is running',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    database: states[dbState] || 'unknown'
  });
});

// Seed API endpoint
app.post('/api/seed', async (req, res, next) => {
  try {
    await runSeed();
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    next(error);
  }
});

// Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});