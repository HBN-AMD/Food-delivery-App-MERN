const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  notes: String,
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },

  // Parties
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  restaurantName: String,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Location
  region: { type: String, default: 'Islamabad' },

  // Order details
  items: [orderItemSchema],
  subtotal: Number,
  deliveryFee: { type: Number, default: 2.99 },
  tax: Number,
  total: Number,
  deliveryAddress: String,

  // Extended status lifecycle
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'],
    default: 'pending',
  },
  estimatedDelivery: String,

  driver: {
    name: { type: String, default: 'Michael J.' },
    rating: { type: Number, default: 4.9 },
    vehicle: { type: String, default: 'Riding a Red Scooter' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
    distanceMiles: { type: Number, default: 1.2 },
  },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FF-${80000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
