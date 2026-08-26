import express from 'express';
import { Order } from '../models/Order.js';
import { tenantMiddleware } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a multi-tenant order
router.post('/', tenantMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, customerName, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const order = new Order({
      tenantId: req.tenantId,
      items,
      totalAmount,
      customerName: customerName || 'Customer',
      customerEmail
    });

    await order.save();
    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get tenant orders
router.get('/', tenantMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ tenantId: req.tenantId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
