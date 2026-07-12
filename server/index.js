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

const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Socket Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token missing'));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Authentication error: User not found'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id} (User: ${socket.user.name}, Role: ${socket.user.role})`);

  // Automatically assign users to their secure rooms based on role
  if (socket.user.role === 'consumer') {
    socket.join(`user_${socket.user._id}`);
    console.log(`👤 Consumer assigned to room: user_${socket.user._id}`);
  } else if (socket.user.role === 'vendor') {
    socket.join(`vendor_${socket.user._id}`);
    console.log(`🏪 Vendor assigned to room: vendor_${socket.user._id}`);
  }

  // Rider goes online/offline in their specific region
  socket.on('join_region', () => {
    if (socket.user.role !== 'rider') return;
    const regionRoom = `region_${socket.user.region}`;
    socket.join(regionRoom);
    console.log(`🛵 Rider joined assigned region: ${regionRoom}`);
  });

  socket.on('leave_region', () => {
    if (socket.user.role !== 'rider') return;
    const regionRoom = `region_${socket.user.region}`;
    socket.leave(regionRoom);
    console.log(`🛵 Rider left assigned region: ${regionRoom}`);
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
