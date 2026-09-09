import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Store } from '../models/Store.js';
import { tenantMiddleware } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// @route   GET /api/analytics/vendor
// @desc    Get analytics metrics & chart data dynamically from MongoDB for a specific vendor tenant
router.get('/vendor', tenantMiddleware, async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId || 'tenant-megastore';

    const orders = await Order.find({ tenantId }).sort({ createdAt: 1 });
    const productsCount = await Product.countDocuments({ tenantId });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Status breakdown
    const statusCounts = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
    orders.forEach(o => {
      const st = (o.status || 'pending').toLowerCase();
      if (statusCounts[st] !== undefined) statusCounts[st]++;
      else statusCounts.pending++;
    });

    const orderStatusBreakdown = [
      { name: 'Completed', count: statusCounts.completed, fill: '#10b981' },
      { name: 'Processing', count: statusCounts.processing, fill: '#3b82f6' },
      { name: 'Pending', count: statusCounts.pending, fill: '#f59e0b' },
      { name: 'Cancelled', count: statusCounts.cancelled, fill: '#ef4444' }
    ];

    // Revenue & Order timeline (Grouped by date)
    const timelineMap = {};
    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!timelineMap[dateStr]) {
        timelineMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
      timelineMap[dateStr].revenue += (o.totalAmount || 0);
      timelineMap[dateStr].orders += 1;
    });

    const revenueTrend = Object.values(timelineMap);

    // Top Selling Products aggregation
    const productSalesMap = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const name = item.name || 'Unnamed Product';
        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        productSalesMap[name].quantity += Number(item.quantity || 1);
        productSalesMap[name].revenue += Number(item.price || 0) * Number(item.quantity || 1);
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          totalProductsCount: productsCount
        },
        revenueTrend,
        orderStatusBreakdown,
        topProducts
      }
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/analytics/super-admin
// @desc    Get aggregated platform multi-tenant analytics & store comparison dynamically from MongoDB
router.get('/super-admin', async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: 1 });
    const allStores = await Store.find();
    const totalProductsCount = await Product.countDocuments();

    const totalPlatformOrders = allOrders.length;
    const totalPlatformRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalStoresCount = allStores.length;

    // Tenant comparison metrics dynamically derived from Stores & Orders
    const tenantMap = {};
    allStores.forEach(s => {
      tenantMap[s.tenantId] = {
        tenantId: s.tenantId,
        storeName: s.name,
        totalRevenue: 0,
        orderCount: 0
      };
    });

    // Populate order totals per tenant
    allOrders.forEach(o => {
      const tId = o.tenantId || 'tenant-megastore';
      if (!tenantMap[tId]) {
        tenantMap[tId] = {
          tenantId: tId,
          storeName: tId.replace('tenant-', '').toUpperCase() + ' Store',
          totalRevenue: 0,
          orderCount: 0
        };
      }
      tenantMap[tId].totalRevenue += (o.totalAmount || 0);
      tenantMap[tId].orderCount += 1;
    });

    const tenantComparison = Object.values(tenantMap);

    // Platform Growth Trend by Month dynamically calculated from Orders
    const monthMap = {};
    allOrders.forEach(o => {
      const monthStr = new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short' });
      if (!monthMap[monthStr]) {
        monthMap[monthStr] = { month: monthStr, revenue: 0, orders: 0 };
      }
      monthMap[monthStr].revenue += (o.totalAmount || 0);
      monthMap[monthStr].orders += 1;
    });

    const platformTrend = Object.values(monthMap);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPlatformRevenue,
          totalPlatformOrders,
          totalStoresCount,
          totalProductsCount
        },
        tenantComparison,
        platformTrend
      }
    });
  } catch (error) {
    console.error('Super Admin analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
