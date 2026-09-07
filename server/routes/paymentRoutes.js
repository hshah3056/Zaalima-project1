import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecret);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, customerInfo, tenantId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    // Convert cart items into Stripe line_items format (amounts in paise)
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.image && item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));

    // Add delivery charge if subtotal < 500
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    if (subtotal < 500) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Standard Delivery Charge',
          },
          unit_amount: 49 * 100,
        },
        quantity: 1,
      });
    }

    const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerInfo?.email || undefined,
      metadata: {
        tenantId: tenantId || 'default',
        customerName: customerInfo?.fullName || '',
        phone: customerInfo?.phone || '',
        pincode: customerInfo?.pincode || '',
        city: customerInfo?.city || '',
        state: customerInfo?.state || '',
      },
      success_url: `${frontendOrigin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendOrigin}/checkout`,
    });

    res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;