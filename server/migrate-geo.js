const mongoose = require('mongoose');
require('dotenv').config();
const Restaurant = require('./models/Restaurant');

async function migrateGeospatial() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetchfood');
    console.log('✅ Connected to MongoDB');

    // Sync indexes to ensure the 2dsphere index is built
    await Restaurant.syncIndexes();
    console.log('✅ Synchronized Restaurant indexes');

    const restaurants = await Restaurant.find();
    let updated = 0;

    for (const rest of restaurants) {
      if (!rest.location || !rest.location.coordinates || rest.location.coordinates.length !== 2) {
        // Assign a default coordinate (e.g., somewhere in Islamabad)
        // Let's add slight randomization so they aren't all exactly stacked on each other
        const lng = 73.0479 + (Math.random() - 0.5) * 0.05; // ~5km spread
        const lat = 33.6844 + (Math.random() - 0.5) * 0.05; // ~5km spread
        
        rest.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        await rest.save();
        updated++;
      }
    }

    console.log(`✅ Migrated ${updated} restaurants with geospatial coordinates.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error migrating database:', err);
    process.exit(1);
  }
}

migrateGeospatial();
