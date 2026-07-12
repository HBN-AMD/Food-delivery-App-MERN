const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

// Helper: get io instance
function getIO(req) {
  return req.app.get('io');
}

// POST /api/orders — consumer places an order
router.post('/', auth, async (req, res) => {
  try {
    const { restaurantId, restaurantName, items, subtotal, deliveryFee, tax, total, deliveryAddress } = req.body;

    // Get restaurant region
    const restaurant = await Restaurant.findById(restaurantId);
    const region = restaurant?.region || 'Islamabad';
    const vendorId = restaurant?.vendorId || null;

    const order = new Order({
      restaurantName,
      restaurant: restaurantId,
      user: req.user._id,
      vendorId,
      region,
      items,
      subtotal,
      deliveryFee: deliveryFee || 2.99,
      tax: tax || subtotal * 0.08,
      total,
      deliveryAddress,
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    await order.save();

    // Emit to vendor's room
    const io = getIO(req);
    if (io) {
      // Notify the vendor directly
      if (vendorId) {
        io.to(`vendor_${vendorId}`).emit('new_order', order);
      }
      // Notify all online riders in the same region
      io.to(`region_${region}`).emit('new_order_available', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        restaurantName,
        region,
        total,
        itemCount: items.length,
      });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — get orders (filtered by role)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'consumer') {
      query.user = req.user._id;
    } else if (req.user.role === 'rider') {
      query.riderId = req.user._id;
    } else if (req.user.role === 'vendor') {
      query.vendorId = req.user._id;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — update order status, emit socket event
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify the consumer in real-time
    const io = getIO(req);
    if (io) {
      io.to(`user_${order.user}`).emit('order_status_update', { orderId: order._id, status });
      // Notify vendor too
      if (order.vendorId) {
        io.to(`vendor_${order.vendorId}`).emit('order_status_update', { orderId: order._id, status });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
