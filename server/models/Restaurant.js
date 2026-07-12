const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisines: [String],
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 100 },
  deliveryTime: { type: String, default: '25-35 min' },
  deliveryFee: { type: Number, default: 0 },
  heroImage: { type: String },
  tags: [String],
  badge: { type: String, enum: ['FREE DELIVERY', 'TOP RATED', 'TRENDING', null], default: null },
  isOpen: { type: Boolean, default: true },
  address: { type: String, default: 'Islamabad, Pakistan' },

  // Marketplace fields
  region: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Geospatial
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, default: [73.0479, 33.6844] }, // [lng, lat] (Default: Islamabad)
  }
}, { timestamps: true });

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
