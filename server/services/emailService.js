import nodemailer from 'nodemailer';
import { getTransporter } from '../config/emailConfig.js';

/**
 * Generate Responsive HTML for Order Confirmation Email
 */
const buildOrderConfirmationHtml = (order) => {
  const customerName = order.customerName || 'Valued Customer';
  const orderId = order._id ? String(order._id) : 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const items = order.items || [];
  const totalAmount = order.totalAmount || 0;
  const shippingAddress = order.shippingAddress || 'Address specified during checkout';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemRowsHtml = items.map((item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 1;
    const lineTotal = itemPrice * itemQty;
    return `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #666666; text-align: center;">
          ${itemQty}
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; text-align: right;">
          ₹${itemPrice.toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #e40046; font-weight: bold; text-align: right;">
          ₹${lineTotal.toLocaleString('en-IN')}
        </td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation - Zaalima Store</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background-color: #111827; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ZAALIMA STORE</h1>
        <p style="color: #e40046; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Order & Transaction Confirmation</p>
      </div>

      <!-- Content Banner -->
      <div style="padding: 24px 30px; background-color: #fcf8f9; border-bottom: 1px solid #f3e5e8; text-align: center;">
        <div style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">
          PAYMENT SUCCESSFUL
        </div>
        <h2 style="color: #111827; margin: 0 0 8px 0; font-size: 20px;">Thank you for your order, ${customerName}!</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
          We've received your order and are currently preparing it for shipping.
        </p>
      </div>

      <!-- Order Details -->
      <div style="padding: 24px 30px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; color: #4b5563;">
          <tr>
            <td style="padding: 6px 0;"><strong>Order Reference:</strong> ${orderId}</td>
            <td style="padding: 6px 0; text-align: right;"><strong>Date:</strong> ${orderDate}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 6px 0; border-top: 1px dashed #e5e7eb; margin-top: 6px;">
              <strong>Delivery Address:</strong> ${shippingAddress}
            </td>
          </tr>
        </table>

        <!-- Itemized Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 10px 15px; text-align: left; font-size: 12px; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 10px 15px; text-align: center; font-size: 12px; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 12px; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 10px 15px; text-align: right; font-size: 12px; color: #374151; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsHtml}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #111827; text-align: right;">
          <p style="margin: 4px 0; font-size: 14px; color: #4b5563;">
            Total Amount Paid: <strong style="font-size: 18px; color: #e40046; margin-left: 8px;">₹${totalAmount.toLocaleString('en-IN')}</strong>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        <p style="margin: 0 0 6px 0;">If you have any questions regarding your order, please reply to this email or contact support.</p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Zaalima E-Commerce Platform. All rights reserved.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};

/**
 * Send Transaction Confirmation Email to Client
 */
export const sendOrderConfirmationEmail = async ({ order, recipientEmail }) => {
  try {
    const toEmail = recipientEmail || order.customerEmail;

    if (!toEmail) {
      console.warn('[Email Service] No recipient email address provided for order email.');
      return { success: false, message: 'Missing recipient email' };
    }

    const { transporter, isTestAccount } = await getTransporter();

    const fromName = process.env.MAIL_FROM_NAME || process.env.APP_NAME || process.env.SMTP_FROM_NAME || 'Zaalima Store';
    const fromEmail = process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || process.env.SMTP_FROM_EMAIL || 'contact@zaalima.com';


    const htmlContent = buildOrderConfirmationHtml(order);

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `Order Confirmation #${order._id || 'Zaalima'} - Payment Successful`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Confirmation email sent to ${toEmail} | Message ID: ${info.messageId}`);

    let previewUrl = null;
    if (isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Service] Ethereal Email Web Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl,
      isTestAccount,
    };
  } catch (error) {
    console.error('[Email Service] Error sending order confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Test Email for Debugging & Verification
 */
export const sendTestEmail = async (targetEmail) => {
  const testOrder = {
    _id: 'TEST-ORD-9999',
    customerName: 'Test Customer',
    customerEmail: targetEmail || 'client@example.com',
    shippingAddress: '123 Multi-Tenant Plaza, New Delhi, India',
    totalAmount: 1499,
    createdAt: new Date(),
    items: [
      { name: 'Zaalima Premium Leather Jacket', quantity: 1, price: 1250 },
      { name: 'Express Shipping & Handling', quantity: 1, price: 249 }
    ]
  };

  return await sendOrderConfirmationEmail({ order: testOrder, recipientEmail: targetEmail });
};
