const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Make io accessible to route handlers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Consumer joins their personal room to receive order updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Consumer joined room: user_${userId}`);
  });

  // Vendor joins their personal room to receive new orders
  socket.on('join_vendor_room', (vendorId) => {
    socket.join(`vendor_${vendorId}`);
    console.log(`🏪 Vendor joined room: vendor_${vendorId}`);
  });

  // Rider joins region room when going online
  socket.on('join_region', (region) => {
    socket.join(`region_${region}`);
    console.log(`🛵 Rider joined region: region_${region}`);
  });

  // Rider leaves region room when going offline
  socket.on('leave_region', (region) => {
    socket.leave(`region_${region}`);
    console.log(`🛵 Rider left region: region_${region}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serverless-safe MongoDB connection middleware
app.use(async (req, res, next) => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetchfood';
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/rider', require('./routes/rider'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FetchFood API running',
    dbConfigured: !!process.env.MONGO_URI,
    socketEnabled: true,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, () => console.log(`🚀 Server + Socket.io on http://localhost:${PORT}`));
}

// Export for Vercel (HTTP only — socket.io runs locally or on Railway)
module.exports = app;
