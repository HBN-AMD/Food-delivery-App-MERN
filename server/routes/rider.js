const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

function getIO(req) { return req.app.get('io'); }

// All rider routes require auth + rider role
router.use(auth, requireRole('rider'));

// PATCH /api/rider/online — toggle rider online/offline
router.patch('/online', async (req, res) => {
  try {
    const { isOnline } = req.body;
    await User.findByIdAndUpdate(req.user._id, { isOnline });
    res.json({ isOnline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rider/orders — get available pending orders in rider's region
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({
      region: req.user.region,
      status: { $in: ['pending', 'ready'] },
      riderId: null,
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rider/active — get current active delivery
router.get('/active', async (req, res) => {
  try {
    const order = await Order.findOne({
      riderId: req.user._id,
      status: { $in: ['accepted', 'picked_up'] },
    });
    res.json(order || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rider/accept/:orderId — rider accepts an order
router.post('/accept/:orderId', async (req, res) => {
  try {
    // Check if rider already has an active delivery
    const existing = await Order.findOne({
      riderId: req.user._id,
      status: { $in: ['accepted', 'picked_up'] },
    });
    if (existing) return res.status(400).json({ message: 'You already have an active delivery' });

    const order = await Order.findOneAndUpdate(
      { _id: req.params.orderId, riderId: null, status: { $in: ['pending', 'ready'] } },
      { riderId: req.user._id, status: 'accepted' },
      { new: true }
    );
    if (!order) return res.status(400).json({ message: 'Order no longer available' });

    // Notify consumer and vendor
    const io = getIO(req);
    if (io) {
      io.to(`user_${order.user}`).emit('order_status_update', {
        orderId: order._id,
        status: 'accepted',
        rider: { name: req.user.name, avatar: req.user.avatar },
      });
      if (order.vendorId) {
        io.to(`vendor_${order.vendorId}`).emit('order_status_update', { orderId: order._id, status: 'accepted' });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/rider/orders/:id/status — picked_up or delivered
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['picked_up', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for rider' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, riderId: req.user._id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify consumer
    const io = getIO(req);
    if (io) {
      io.to(`user_${order.user}`).emit('order_status_update', { orderId: order._id, status });
      if (order.vendorId) {
        io.to(`vendor_${order.vendorId}`).emit('order_status_update', { orderId: order._id, status });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rider/earnings — sum delivery fees for completed trips
router.get('/earnings', async (req, res) => {
  try {
    const delivered = await Order.find({
      riderId: req.user._id,
      status: 'delivered',
    }).select('deliveryFee total createdAt');

    const totalEarnings = delivered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    // Today
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayDeliveries = delivered.filter(o => new Date(o.createdAt) >= todayStart);
    const todayEarnings = todayDeliveries.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    res.json({
      totalEarnings: totalEarnings.toFixed(2),
      todayEarnings: todayEarnings.toFixed(2),
      totalDeliveries: delivered.length,
      todayDeliveries: todayDeliveries.length,
      recent: delivered.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
