const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const JWT_SECRET = process.env.JWT_SECRET || 'fetchfood_secret_2024';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, role, region, restaurantName } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userRole = ['consumer', 'rider', 'vendor'].includes(role) ? role : 'consumer';

    const user = new User({
      name,
      email,
      password: hashed,
      location: location || region || 'Islamabad',
      role: userRole,
      region: region || 'Islamabad',
    });

    // If registering as vendor, create a restaurant for them
    if (userRole === 'vendor' && restaurantName) {
      const restaurant = await Restaurant.create({
        name: restaurantName,
        cuisines: ['Various'],
        region: region || 'Islamabad',
        address: `${region || 'Islamabad'}, Pakistan`,
        heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
      });
      user.restaurantId = restaurant._id;
      // Link restaurant back to vendor
      restaurant.vendorId = user._id;
      await restaurant.save();
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role, region: user.region },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        role: user.role,
        region: user.region,
        restaurantId: user.restaurantId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role, region: user.region },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        location: user.location,
        role: user.role,
        region: user.region,
        restaurantId: user.restaurantId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
