const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// GET /api/restaurants/nearby — geospatial search
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ message: 'Missing lng or lat parameters' });
    }

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'calculatedDistance',
          maxDistance: 5000, // 5km radius
          spherical: true,
        }
      },
      {
        $sort: { calculatedDistance: 1 }
      }
    ]);

    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants — list all restaurants (with optional cuisine filter)
router.get('/', async (req, res) => {
  try {
    const { cuisine, region } = req.query;
    let query = {};
    if (cuisine && cuisine !== 'All Foods') {
      query.cuisines = { $in: [cuisine] };
    }
    if (region) {
      query.region = region;
    }
    const restaurants = await Restaurant.find(query).sort({ rating: -1 });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id — single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id/menu — menu for a restaurant
router.get('/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.id });
    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ items, grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
