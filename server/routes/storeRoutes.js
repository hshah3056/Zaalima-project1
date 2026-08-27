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
// @desc    Create a new store (Vendors & Admins only - RBAC protected)
router.post('/', authMiddleware, authorizeRoles('vendor', 'admin'), async (req, res) => {
  try {
    const { name, tagline, themeColor, bannerTitle, bannerSubtitle } = req.body;

    const tenantId = `tenant-${name.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now()}`;
    const store = new Store({
      tenantId,
      name,
      tagline,
      themeColor,
      bannerTitle,
      bannerSubtitle,
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
router.put('/:tenantId', authMiddleware, authorizeRoles('vendor', 'admin'), async (req, res) => {
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

export default router;
