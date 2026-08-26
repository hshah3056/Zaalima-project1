import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { runSeed } from './seed.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Zaalima E-Commerce Multi-Tenant API',
    endpoints: {
      health: '/health',
      auth: '/api/auth (register, login, me)',
      stores: '/api/stores',
      products: '/api/products',
      orders: '/api/orders',
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
    database: states[dbState] || 'unknown'
  });
});

// Seed API endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await runSeed();
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});