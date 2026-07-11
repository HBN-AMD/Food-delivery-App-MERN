# FetchFood — Build Complete ✅

The **FetchFood** MERN stack food delivery app is built and running locally, faithfully replicating the uploaded designs.

---

## 🚀 Both servers are running

| Server | URL | Status |
|---|---|---|
| **Backend** (Express + MongoDB) | http://localhost:5000 | ✅ Running |
| **Frontend** (React + Vite) | http://localhost:5173 | ✅ Running |

> [!IMPORTANT]
> Open **http://localhost:5173** in your browser to use the app.

---

## 🔑 Demo Login

```
Email:    alex@fetchfood.com
Password: password123
```

---

## 📁 Project Structure

```
fetchfood/
├── server/              ← Express + MongoDB backend (port 5000)
│   ├── models/          ← User, Restaurant, MenuItem, Order schemas
│   ├── routes/          ← /api/auth, /api/restaurants, /api/orders
│   ├── middleware/      ← JWT auth
│   ├── index.js         ← Entry point
│   └── seed.js          ← Seeds 8 restaurants, 34 menu items, sample order
│
└── client/              ← React + Vite frontend (port 5173)
    └── src/
        ├── pages/       ← HomePage, RestaurantPage, OrderTrackingPage, AuthPage
        ├── components/  ← Sidebar, Topbar, RestaurantCard, CartSidebar, MapView
        ├── context/     ← CartContext, AuthContext
        └── api/         ← Axios API client
```

---

## 📱 Pages Built

### 1. Home Page (`/`)
- Left sidebar with nav links and FetchPro upgrade card
- Search bar, notification bell, user avatar in topbar
- **"50% Off First Order"** hero banner + "Fastest Delivery" green card
- **Cuisine filter pills** (All Foods, Fast Food, Desi, Healthy, etc.)
- **Restaurant cards grid** with ratings, delivery time, badges
- **"Order it again"** horizontal scroll row

### 2. Restaurant / Menu Page (`/restaurant/:id`)
- Full-width hero image with restaurant name, rating, cuisine tags
- **Category tab bar** (Most Popular, Signature Burgers, etc.)
- **2-column menu grid** with food photos, descriptions, prices
- **Live cart sidebar** with +/− quantity controls, subtotal, total, and Checkout button

### 3. Order Tracking Page (`/track/:id`)
- Order number, restaurant name, **"Arriving in 12m"** badge
- **Status timeline** (Order Preparing → Picked Up → Arriving Soon → Delivered)
- **Driver card** with avatar, rating, vehicle, call/chat buttons
- Order summary with items and totals
- **Leaflet.js map** (San Francisco) with animated driver 🛵 moving toward destination along a dashed red route
- "Live Tracking • 1.2 miles away" chip overlay

---

## 🍔 Seeded Data

| Restaurant | Cuisine | Rating |
|---|---|---|
| Royal Spice | Indian, Desi | ⭐ 4.9 |
| The Gourmet Foundry | American, Burgers | ⭐ 4.8 |
| The Burger Bar | Burgers, Fast Food | ⭐ 4.8 |
| Sushi Zen | Japanese, Seafood | ⭐ 4.5 |
| Morning Bliss | Breakfast, Desserts | ⭐ 4.2 |
| Pizza Hut | Italian, Fast Food | ⭐ 4.3 |
| Green Eats | Healthy, Vegan | ⭐ 4.6 |
| Sweet Spot | Desserts | ⭐ 4.7 |

---

## 🔁 Re-seeding the Database

```bash
cd /Users/mc/.gemini/antigravity/scratch/fetchfood/server
node seed.js
```

## 🔄 Restarting Servers

```bash
# Backend
cd .../fetchfood/server && npm run dev

# Frontend
cd .../fetchfood/client && npm run dev
```
