import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'zaalima_super_secret_jwt_key_2026', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Customer or Vendor)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'customer', storeName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Create User
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // If role is Vendor and storeName provided, create Store
    if (role === 'vendor') {
      const tenantId = `tenant-${storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
      const store = new Store({
        tenantId,
        name: storeName || `${name}'s Store`,
        owner: user._id
      });
      await store.save();
      user.storeId = store._id;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
router.get('/me', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

export default router;
