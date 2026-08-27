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
    const filter = {};

    // Apply tenant filter if tenantId header or query is present
    if (req.tenantId) {
      filter.tenantId = req.tenantId;
    }

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

    const products = await Product.find(filter).sort({ createdAt: -1 });
    const allTenantProducts = await Product.find(req.tenantId ? { tenantId: req.tenantId } : {});
    const categories = ['All', ...new Set(allTenantProducts.map((p) => p.category))];

    res.status(200).json({
      success: true,
      tenantId: req.tenantId,
      count: products.length,
      categories,
      data: products,
      products // for compatibility
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/products
// @desc    Add a product (Vendors & Admins only - RBAC protected)
router.post('/', authMiddleware, authorizeRoles('vendor', 'admin'), tenantMiddleware, async (req, res) => {
  try {
    const { name, title, brand, price, originalPrice, discount, category, image, isDealOfTheDay, stock } = req.body;

    const productName = name || title;

    if (!productName || !price) {
      return res.status(400).json({ success: false, message: 'Product name/title and price are required' });
    }

    const computedOriginalPrice = originalPrice || Math.round(Number(price) * 1.3);
    const computedDiscount = discount || `${Math.round(((computedOriginalPrice - price) / computedOriginalPrice) * 100)}% OFF`;

    const product = new Product({
      tenantId: req.tenantId || 'tenant-megastore',
      name: productName,
      brand: brand || 'Generic Brand',
      price: Number(price),
      originalPrice: Number(computedOriginalPrice),
      discount: computedDiscount,
      category: category || 'Electronics',
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      isDealOfTheDay: isDealOfTheDay === true || isDealOfTheDay === 'true',
      stock: stock ? Number(stock) : 25,
      createdBy: req.user._id
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product details (price, stock, category, deal status)
router.put('/:id', authMiddleware, authorizeRoles('vendor', 'admin'), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.title && !updates.name) {
      updates.name = updates.title;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product item
router.delete('/:id', authMiddleware, authorizeRoles('vendor', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
