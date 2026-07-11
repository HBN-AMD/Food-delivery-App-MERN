const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serverless MongoDB Connection Middleware
app.use(async (req, res, next) => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetchfood';
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ MongoDB connected for Serverless invocation');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FetchFood API running',
    dbConfigured: !!process.env.MONGO_URI
  });
});

// Start server locally (Vercel handles this automatically in production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;
