import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'zaalima_super_secret_jwt_key_2026', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/seed-roles
// @desc    Provision standard demo accounts for all 4 roles
router.post('/seed-roles', async (req, res) => {
  try {
    const demoAccounts = [
      {
        name: 'Platform Super Admin',
        email: 'superadmin@zaalima.com',
        password: 'password123',
        role: 'superadmin',
        permissions: ['manage_products', 'manage_orders', 'view_analytics', 'manage_stores', 'manage_users']
      },
      {
        name: 'Store System Admin',
        email: 'admin@zaalima.com',
        password: 'password123',
        role: 'admin',
        permissions: ['manage_products', 'manage_orders', 'view_analytics']
      },
      {
        name: 'Vendor Partner',
        email: 'vendor@zaalima.com',
        password: 'password123',
        role: 'vendor',
        permissions: ['manage_products', 'manage_orders']
      },
      {
        name: 'Customer Account',
        email: 'customer@zaalima.com',
        password: 'password123',
        role: 'customer',
        permissions: []
      }
    ];

    const results = [];

    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = new User(acc);
        await user.save();

        if (acc.role === 'vendor') {
          let store = await Store.findOne({ tenantId: 'tenant-megastore' });
          if (!store) {
            store = new Store({
              tenantId: 'tenant-megastore',
              name: 'MegaStore Partner Store',
              owner: user._id
            });
            await store.save();
          }
          user.storeId = store._id;
          await user.save();
        }

        results.push({ email: acc.email, role: acc.role, status: 'created' });
      } else {
        // Ensure role & permissions match demo config
        user.role = acc.role;
        user.permissions = acc.permissions;
        await user.save();
        results.push({ email: acc.email, role: acc.role, status: 'updated' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Role demo accounts seeded successfully',
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user (Customer, Vendor, or Admin)
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

    const defaultPermissions = role === 'admin' 
      ? ['manage_products', 'manage_orders', 'view_analytics']
      : role === 'superadmin' 
      ? ['manage_products', 'manage_orders', 'view_analytics', 'manage_stores', 'manage_users']
      : [];

    const user = new User({
      name,
      email,
      password,
      role,
      permissions: defaultPermissions
    });

    await user.save();

    if (role === 'vendor' && storeName) {
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
          permissions: user.permissions,
          storeId: user.storeId
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return role token
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
          permissions: user.permissions || [],
          storeId: user.storeId,
          tenantId: user.tenantId || 'tenant-megastore',
          phone: user.phone || '+91 9876543210',
          address: user.address || 'Connaught Place, Central Delhi, New Delhi - 110001'
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

// @route   PUT /api/auth/profile
// @desc    Update current authenticated user profile details
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        permissions: updatedUser.permissions || [],
        storeId: updatedUser.storeId,
        tenantId: updatedUser.tenantId || 'tenant-megastore',
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/auth/users
// @desc    List all users with optional role filtering and populated store/order stats (Super Admin & Admin)
router.get('/users', authMiddleware, authorizeRoles('superadmin', 'admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).populate('storeId').select('-password').sort({ createdAt: -1 });

    // Fetch order aggregation metrics for customers & users
    const OrderModule = (await import('../models/Order.js')).Order;
    const allOrders = await OrderModule.find();

    const populatedUsers = users.map(u => {
      const uObj = u.toObject();
      
      // Calculate order statistics for customer/user
      const userOrders = allOrders.filter(o => 
        (o.user && o.user.toString() === u._id.toString()) || 
        (o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase())
      );

      uObj.ordersCount = userOrders.length;
      uObj.totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      if (u.storeId && typeof u.storeId === 'object') {
        uObj.storeName = u.storeId.name;
        uObj.tenantId = u.storeId.tenantId;
      }

      return uObj;
    });

    res.status(200).json({ success: true, count: populatedUsers.length, data: populatedUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/auth/users
// @desc    Create a new user (Super Admin only)
router.post('/users', authMiddleware, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, address, storeName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const defaultPermissions = role === 'admin' 
      ? ['manage_products', 'manage_orders', 'view_analytics']
      : role === 'superadmin' 
      ? ['manage_products', 'manage_orders', 'view_analytics', 'manage_stores', 'manage_users']
      : role === 'vendor'
      ? ['manage_products', 'manage_orders']
      : [];

    const user = new User({
      name,
      email,
      password,
      role,
      permissions: defaultPermissions,
      phone: phone || '+91 9876543210',
      address: address || 'Connaught Place, Central Delhi, New Delhi'
    });

    await user.save();

    if (role === 'vendor' && storeName) {
      const tenantId = `tenant-${storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
      let store = new Store({
        tenantId,
        name: storeName,
        owner: user._id
      });
      await store.save();
      user.storeId = store._id;
      user.tenantId = tenantId;
      await user.save();
    }

    const uObj = user.toObject();
    delete uObj.password;

    res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} user created successfully`,
      data: uObj
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user details (Super Admin only)
router.put('/users/:id', authMiddleware, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { name, email, role, phone, address } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user record (Super Admin only)
router.delete('/users/:id', authMiddleware, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/auth/users/:id/permissions
// @desc    Update permissions & route access for Admin users (Super Admin only)
router.put('/users/:id/permissions', authMiddleware, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const { permissions, role } = req.body;
    const updateData = {};
    if (permissions) updateData.permissions = permissions;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin permissions updated successfully by Super Admin',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

