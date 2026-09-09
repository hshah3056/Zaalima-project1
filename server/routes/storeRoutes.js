import express from 'express';
import { Store } from '../models/Store.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/stores
// @desc    Get all multi-tenant stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json({ success: true, count: stores.length, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/stores
// @desc    Create a new store (Super Admin, Vendors & Admins - RBAC protected)
router.post('/', authMiddleware, authorizeRoles('superadmin', 'vendor', 'admin'), async (req, res) => {
  try {
    const { name, tagline, themeColor, bannerTitle, bannerSubtitle } = req.body;

    const tenantId = `tenant-${name.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
    const store = new Store({
      tenantId,
      name,
      tagline: tagline || 'Official Brand Store',
      themeColor: themeColor || '#e40046',
      bannerTitle: bannerTitle || 'Mega Festival Sale',
      bannerSubtitle: bannerSubtitle || 'Up to 80% OFF on Top Verified Products',
      owner: req.user._id
    });

    await store.save();
    res.status(201).json({ success: true, message: 'Store created successfully', data: store });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/stores/:tenantId
// @desc    Update store configuration details
router.put('/:tenantId', authMiddleware, authorizeRoles('superadmin', 'vendor', 'admin'), async (req, res) => {
  try {
    const { name, tagline, themeColor, bannerTitle, bannerSubtitle } = req.body;
    const store = await Store.findOneAndUpdate(
      { tenantId: req.params.tenantId },
      { name, tagline, themeColor, bannerTitle, bannerSubtitle },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(200).json({ success: true, message: 'Store updated successfully', data: store });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/stores/:tenantId
// @desc    Delete a store tenant (Super Admin only)
router.delete('/:tenantId', authMiddleware, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({ tenantId: req.params.tenantId });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    res.status(200).json({ success: true, message: 'Store tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
