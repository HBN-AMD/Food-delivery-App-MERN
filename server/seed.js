const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fetchfood';

const restaurants = [
  {
    name: 'The Gourmet Foundry',
    cuisines: ['American', 'Burgers', 'Craft Drinks'],
    rating: 4.8,
    reviewCount: 500,
    deliveryTime: '20-30 min',
    deliveryFee: 0,
    heroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop',
    tags: ['Artisanal Burgers', 'American', 'Craft Drinks'],
    badge: 'TRENDING',
  },
  {
    name: 'The Burger Bar',
    cuisines: ['Burgers', 'American', 'Fast Food'],
    rating: 4.8,
    reviewCount: 320,
    deliveryTime: '20-30 min',
    deliveryFee: 0,
    heroImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop',
    tags: ['Burgers', 'American', 'Fries'],
    badge: 'FREE DELIVERY',
  },
  {
    name: 'Sushi Zen',
    cuisines: ['Japanese', 'Seafood', 'Sushi'],
    rating: 4.5,
    reviewCount: 210,
    deliveryTime: '35-45 min',
    deliveryFee: 2.99,
    heroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&h=400&fit=crop',
    tags: ['Japanese', 'Seafood', 'Rolls'],
    badge: null,
  },
  {
    name: 'Royal Spice',
    cuisines: ['Indian', 'Desi', 'Healthy'],
    rating: 4.9,
    reviewCount: 680,
    deliveryTime: '25-35 min',
    deliveryFee: 0,
    heroImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop',
    tags: ['Indian', 'Curry', 'Tandoori'],
    badge: 'TOP RATED',
  },
  {
    name: 'Morning Bliss',
    cuisines: ['Breakfast', 'Desserts', 'Beverages'],
    rating: 4.2,
    reviewCount: 150,
    deliveryTime: '15-25 min',
    deliveryFee: 1.50,
    heroImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=400&fit=crop',
    tags: ['Breakfast', 'Pancakes', 'Coffee'],
    badge: null,
  },
  {
    name: 'Pizza Hut',
    cuisines: ['Fast Food', 'Italian'],
    rating: 4.3,
    reviewCount: 890,
    deliveryTime: '30-40 min',
    deliveryFee: 1.99,
    heroImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop',
    tags: ['Pizza', 'Italian', 'Fast Food'],
    badge: null,
  },
  {
    name: 'Green Eats',
    cuisines: ['Healthy', 'Vegan'],
    rating: 4.6,
    reviewCount: 280,
    deliveryTime: '20-30 min',
    deliveryFee: 0,
    heroImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop',
    tags: ['Healthy', 'Vegan', 'Salads'],
    badge: null,
  },
  {
    name: 'Sweet Spot',
    cuisines: ['Desserts', 'Beverages'],
    rating: 4.7,
    reviewCount: 400,
    deliveryTime: '15-20 min',
    deliveryFee: 1.50,
    heroImage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=400&fit=crop',
    tags: ['Desserts', 'Cakes', 'Pastries'],
    badge: null,
  },
];

// Menu items per restaurant (index-based)
const menuItemsData = {
  'The Gourmet Foundry': [
    { name: 'The Foundry Prime', description: 'Aged wagyu beef, caramelized onions, truffle aioli, and vintage cheddar on a brioche bun.', price: 18.50, category: 'Most Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    { name: 'Truffle Parm Fries', description: 'Hand-cut russet potatoes, white truffle oil, shaved parmesan, and fresh herbs.', price: 9.00, category: 'Most Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
    { name: 'Hibiscus Craft Tea', description: 'House-brewed hibiscus flowers, organic agave, and a splash of citrus.', price: 6.50, category: 'Most Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop' },
    { name: 'The Green Foundry', description: "Impossible™ patty, avocado smash, pickled sprouts, and vegan harissa on sourdough.", price: 17.00, category: 'Most Popular', isPopular: true, isVeg: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop' },
    { name: 'Smash Double Stack', description: 'Two smashed beef patties, American cheese, pickles, and special sauce.', price: 15.50, category: 'Signature Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    { name: 'Onion Rings Basket', description: 'Thick-cut beer-battered onion rings with sriracha mayo dip.', price: 7.50, category: 'Sides & Snacks', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop' },
    { name: 'Mango Lemonade', description: 'Fresh squeezed lemonade blended with Alphonso mango puree.', price: 5.50, category: 'Craft Drinks', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop' },
    { name: 'Molten Chocolate Cake', description: 'Warm dark chocolate lava cake with vanilla ice cream and berry coulis.', price: 8.50, category: 'Desserts', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop' },
  ],
  'The Burger Bar': [
    { name: 'Signature Truffle Burger', description: 'Wagyu beef patty, black truffle aioli, caramelized onions, and aged cheddar.', price: 18.50, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    { name: 'Spicy Nashville Chicken', description: 'Crispy buttermilk fried chicken tossed in hot honey sauce, on a brioche bun.', price: 14.99, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop' },
    { name: 'Parmesan Truffle Fries', description: 'Hand-cut fries tossed in truffle oil, fresh parsley, and parmesan shavings.', price: 7.25, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
    { name: 'Avocado Garden Salad', description: 'Mixed greens, fresh avocado slices, cherry tomatoes, and house vinaigrette.', price: 12.00, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
    { name: 'Double Smash Burger', description: 'Two thin smashed patties, double American cheese, pickles, mustard, and onions.', price: 15.50, category: 'Burgers', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop' },
    { name: 'Classic Cheeseburger', description: 'Grass-fed beef, American cheese, lettuce, tomato, and special sauce.', price: 11.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
    { name: 'Craft Root Beer', description: 'Small-batch brewed root beer with natural vanilla and wintergreen.', price: 4.50, category: 'Drinks', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop' },
  ],
  'Sushi Zen': [
    { name: 'Dragon Roll', description: 'Shrimp tempura inside, avocado outside with eel sauce and sesame.', price: 16.00, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop' },
    { name: 'Salmon Sashimi (6pc)', description: 'Fresh Atlantic salmon, thinly sliced, served with pickled ginger and wasabi.', price: 18.00, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop' },
    { name: 'Spicy Tuna Roll', description: 'Fresh tuna, spicy mayo, cucumber, and toasted sesame seeds.', price: 14.00, category: 'Rolls', image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&h=300&fit=crop' },
    { name: 'Edamame', description: 'Steamed soybeans lightly salted with sea salt.', price: 5.00, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop' },
    { name: 'Miso Soup', description: 'Traditional white miso broth with tofu, wakame, and scallions.', price: 4.00, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop' },
  ],
  'Royal Spice': [
    { name: 'Butter Chicken', description: 'Tender chicken in a rich tomato-cream sauce with aromatic spices and naan.', price: 16.99, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop' },
    { name: 'Lamb Biryani', description: 'Fragrant basmati rice layered with slow-cooked spiced lamb and saffron.', price: 18.50, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop' },
    { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in a tandoor with peppers and onions.', price: 13.99, category: 'Starters', isVeg: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop' },
    { name: 'Garlic Naan', description: 'Soft leavened bread baked in a clay oven with garlic butter.', price: 3.99, category: 'Bread', isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop' },
  ],
  'Morning Bliss': [
    { name: 'Blueberry Pancake Stack', description: 'Fluffy buttermilk pancakes loaded with fresh blueberries and maple syrup.', price: 12.99, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' },
    { name: 'Avocado Keto Bowl', description: 'Mixed greens, avocado, poached egg, cherry tomatoes, and tahini dressing.', price: 14.50, category: 'Healthy', isVeg: true, isPopular: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
    { name: 'Cold Brew Coffee', description: 'Slow-steeped 24-hour cold brew over ice with oat milk.', price: 5.99, category: 'Beverages', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop' },
  ],
  'Pizza Hut': [
    { name: 'Pepperoni Feast', description: 'Loaded with double pepperoni on our classic tomato sauce with mozzarella.', price: 14.99, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
    { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ base, grilled chicken, red onion, and cilantro.', price: 16.99, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
    { name: 'Garlic Breadsticks', description: 'Oven-baked breadsticks brushed with garlic butter and herbs.', price: 5.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop' },
  ],
  'Green Eats': [
    { name: 'Avocado Keto Bowl', description: 'Mixed greens, fresh avocado slices, cherry tomatoes, quinoa, and tahini.', price: 14.50, category: 'Popular', isPopular: true, isVeg: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
    { name: 'Green Goddess Wrap', description: 'Spinach tortilla stuffed with hummus, roasted veggies, and feta cheese.', price: 11.99, category: 'Popular', isVeg: true, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop' },
  ],
  'Sweet Spot': [
    { name: 'Molten Lava Cake', description: 'Rich dark chocolate lava cake with a gooey center and vanilla ice cream.', price: 8.50, category: 'Popular', isPopular: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop' },
    { name: 'Strawberry Cheesecake', description: 'New York-style cheesecake with fresh strawberry coulis and whipped cream.', price: 7.99, category: 'Popular', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop' },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([User.deleteMany(), Restaurant.deleteMany(), MenuItem.deleteMany(), Order.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const hashedPwd = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'alex@fetchfood.com',
      password: hashedPwd,
      location: 'Dubai, UAE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    });
    console.log('👤 Created demo user: alex@fetchfood.com / password123');

    // Create restaurants
    const createdRestaurants = await Restaurant.insertMany(restaurants);
    console.log(`🍔 Created ${createdRestaurants.length} restaurants`);

    // Create menu items
    const restaurantMap = {};
    createdRestaurants.forEach(r => { restaurantMap[r.name] = r._id; });

    const allMenuItems = [];
    for (const [restName, items] of Object.entries(menuItemsData)) {
      const restId = restaurantMap[restName];
      if (!restId) continue;
      items.forEach(item => allMenuItems.push({ ...item, restaurant: restId }));
    }
    await MenuItem.insertMany(allMenuItems);
    console.log(`🍽️  Created ${allMenuItems.length} menu items`);

    // Create a sample order for tracking demo
    const burgerBar = createdRestaurants.find(r => r.name === 'The Burger Bar');
    const sampleOrder = await Order.create({
      restaurantName: 'Burger Palace',
      restaurant: burgerBar._id,
      user: user._id,
      items: [
        { name: '2x Signature Burger', price: 24.00, quantity: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop' },
        { name: '1x Truffle Fries', price: 7.50, quantity: 1, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=80&h=80&fit=crop' },
      ],
      subtotal: 31.50,
      deliveryFee: 0,
      tax: 2.75,
      total: 34.25,
      status: 'arriving',
      estimatedDelivery: '12:45 PM',
      deliveryAddress: '123 Main St, San Francisco, CA',
    });
    console.log(`📦 Created sample order: ${sampleOrder.orderNumber}`);

    console.log('\n🎉 Seed complete! Sample order ID for tracking:', sampleOrder._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
