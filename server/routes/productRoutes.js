import express from 'express';
import { Product } from '../models/Product.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { tenantMiddleware } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get products isolated by tenant ID
router.get('/', tenantMiddleware, async (req, res) => {
  try {
    const { category, search, dealOfTheDay } = req.query;
    const filter = { tenantId: req.tenantId };

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    if (dealOfTheDay === 'true') {
      filter.isDealOfTheDay = true;
    }

    const products = await Product.find(filter);
    const categories = ['All', ...new Set((await Product.find({ tenantId: req.tenantId })).map((p) => p.category))];

    res.status(200).json({
      success: true,
      tenantId: req.tenantId,
      count: products.length,
      categories,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/products
// @desc    Add a product (Vendors & Admins only - RBAC protected)
router.post('/', authMiddleware, authorizeRoles('vendor', 'admin'), tenantMiddleware, async (req, res) => {
  try {
    const { name, brand, price, originalPrice, discount, category, image, isDealOfTheDay, stock } = req.body;

    const product = new Product({
      tenantId: req.tenantId,
      name,
      brand,
      price,
      originalPrice,
      discount,
      category,
      image,
      isDealOfTheDay,
      stock,
      createdBy: req.user._id
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
