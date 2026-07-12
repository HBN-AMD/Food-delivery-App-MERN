const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' },
  location: { type: String, default: 'Islamabad' },

  // Multi-role marketplace fields
  role: { type: String, enum: ['consumer', 'rider', 'vendor'], default: 'consumer' },
  region: { type: String, default: 'Islamabad' },

  // Vendor: links to their restaurant
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },

  // Rider: online/offline status
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
