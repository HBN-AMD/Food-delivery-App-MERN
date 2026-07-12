const mongoose = require('mongoose');
require('dotenv').config();
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

async function cleanDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetchfood');
    console.log('✅ Connected to MongoDB');

    // Find restaurants that do not have a vendorId (these are the seeded/dummy ones)
    const dummyRestaurants = await Restaurant.find({ vendorId: null });
    const dummyIds = dummyRestaurants.map(r => r._id);

    console.log(`Found ${dummyIds.length} dummy restaurants.`);

    if (dummyIds.length > 0) {
      // Delete menus for these restaurants
      const menusDeleted = await MenuItem.deleteMany({ restaurant: { $in: dummyIds } });
      console.log(`Deleted ${menusDeleted.deletedCount} dummy menu items.`);

      // Delete orders for these restaurants
      const ordersDeleted = await Order.deleteMany({ restaurant: { $in: dummyIds } });
      console.log(`Deleted ${ordersDeleted.deletedCount} dummy orders.`);

      // Delete the dummy restaurants
      const restsDeleted = await Restaurant.deleteMany({ _id: { $in: dummyIds } });
      console.log(`Deleted ${restsDeleted.deletedCount} dummy restaurants.`);
    }

    // Also delete any orders without a user
    const orphanOrders = await Order.deleteMany({ user: null });
    console.log(`Deleted ${orphanOrders.deletedCount} orphan orders.`);

    console.log('✅ Database clean up complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning database:', err);
    process.exit(1);
  }
}

cleanDB();
