import express from 'express';
import { Order } from '../models/Order.js';
import { tenantMiddleware } from '../middleware/tenantMiddleware.js';
import { sendOrderConfirmationEmail, sendTestEmail } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/orders/test-email
// @desc    Send a test transaction confirmation email
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendTestEmail(email || 'customer@example.com');
    res.status(200).json({
      success: true,
      message: 'Test confirmation email sent successfully',
      details: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a multi-tenant order
router.post('/', tenantMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, customerName, customerEmail, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const order = new Order({
      tenantId: req.tenantId || 'tenant-megastore',
      items,
      totalAmount,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || 'customer@example.com',
      shippingAddress: shippingAddress || 'Default Address'
    });

    await order.save();

    // Trigger transaction confirmation email asynchronously
    sendOrderConfirmationEmail({ order, recipientEmail: order.customerEmail })
      .then((emailRes) => {
        if (emailRes.previewUrl) {
          console.log(`[Order Route] Test Email Preview Link: ${emailRes.previewUrl}`);
        }
      })
      .catch((err) => console.error('[Order Route] Failed to send order email:', err.message));

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get tenant orders
router.get('/', tenantMiddleware, async (req, res) => {
  try {
    const filter = req.tenantId ? { tenantId: req.tenantId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
router.put('/:id', tenantMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
