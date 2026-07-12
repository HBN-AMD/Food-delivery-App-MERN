const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

function getIO(req) { return req.app.get('io'); }

// All vendor routes require auth + vendor role
router.use(auth, requireRole('vendor'));

// GET /api/vendor/restaurant — get vendor's restaurant
router.get('/restaurant', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found. Please contact support.' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/vendor/status — toggle restaurant open/closed
router.patch('/status', async (req, res) => {
  try {
    const { isOpen } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurantId,
      { isOpen },
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/vendor/orders — live orders for vendor's restaurant
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({
      restaurant: req.user.restaurantId,
      status: { $in: ['pending', 'accepted', 'preparing', 'ready'] },
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/vendor/orders/:id/status — vendor updates order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'preparing', 'ready'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status for vendor' });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: req.user.restaurantId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify consumer and riders
    const io = getIO(req);
    if (io) {
      io.to(`user_${order.user}`).emit('order_status_update', { orderId: order._id, status });
      if (status === 'ready') {
        io.to(`region_${order.region}`).emit('order_ready_for_pickup', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          restaurantName: order.restaurantName,
          region: order.region,
        });
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/vendor/menu — get all menu items
router.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.user.restaurantId }).sort({ category: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/vendor/menu — add new menu item
router.post('/menu', async (req, res) => {
  try {
    const { name, description, price, category, image, isVeg, isPopular } = req.body;
    const item = await MenuItem.create({
      restaurant: req.user.restaurantId,
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      isVeg: !!isVeg,
      isPopular: !!isPopular,
      isAvailable: true,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/vendor/menu/:itemId — edit menu item
router.patch('/menu/:itemId', async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, restaurant: req.user.restaurantId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/vendor/menu/:itemId/availability — toggle availability
router.patch('/menu/:itemId/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, restaurant: req.user.restaurantId },
      { isAvailable },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/vendor/menu/:itemId — delete menu item
router.delete('/menu/:itemId', async (req, res) => {
  try {
    await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurant: req.user.restaurantId });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/vendor/analytics — revenue & order stats
router.get('/analytics', async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    // All delivered orders for this restaurant
    const allDelivered = await Order.find({
      restaurant: restaurantId,
      status: 'delivered',
    }).select('total createdAt');

    // Total revenue
    const totalRevenue = allDelivered.reduce((sum, o) => sum + (o.total || 0), 0);

    // Today's revenue
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = allDelivered.filter(o => new Date(o.createdAt) >= todayStart);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Last 7 days daily breakdown
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - i); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = allDelivered.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      });
      daily.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }

    // All-time total orders
    const totalOrders = await Order.countDocuments({ restaurant: restaurantId });
    const avgOrderValue = allDelivered.length > 0 ? totalRevenue / allDelivered.length : 0;

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      todayRevenue: todayRevenue.toFixed(2),
      totalOrders,
      deliveredOrders: allDelivered.length,
      avgOrderValue: avgOrderValue.toFixed(2),
      daily,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
