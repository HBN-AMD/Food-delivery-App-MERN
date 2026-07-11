# FetchFood — MERN Stack Food Delivery App

A full-stack food delivery application modelled on the uploaded design, built with MongoDB, Express, React, and Node.js.

---

## Overview

Three main screens from the designs will be implemented:

| Screen | Description |
|---|---|
| **Home** | Sidebar nav, search bar, promotional banners, cuisine filters, restaurant cards, "Order it again" |
| **Restaurant / Menu** | Hero image, category tabs, menu item cards, live cart sidebar with checkout |
| **Order Tracking** | Order status timeline, simulated live map, driver info panel |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, React Router v6 |
| **Styling** | Vanilla CSS (design system with CSS variables) |
| **State** | React Context API (Cart + Auth) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **API comm.** | Axios (REST) |
| **Map** | Leaflet.js (open-source, no API key needed) |
| **Auth** | JWT + bcrypt |

---

## Proposed Changes

### Project Structure

```
fetchfood/
├── server/                  # Express + MongoDB backend
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── restaurants.js
│   │   ├── menu.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── seed.js              # Seed DB with sample data
│   └── index.js
└── client/                  # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── RestaurantCard.jsx
    │   │   ├── MenuItemCard.jsx
    │   │   ├── CartSidebar.jsx
    │   │   ├── OrderTracker.jsx
    │   │   └── MapView.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── RestaurantPage.jsx
    │   │   └── OrderTrackingPage.jsx
    │   ├── context/
    │   │   ├── CartContext.jsx
    │   │   └── AuthContext.jsx
    │   ├── api/
    │   │   └── index.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

### Backend — `server/`

#### [NEW] `server/index.js`
Main Express server entry point. Connects to MongoDB, registers routes, and serves on port 5000.

#### [NEW] `server/models/`
- **User.js** — name, email, password (hashed), avatar, location
- **Restaurant.js** — name, cuisine, rating, delivery time, delivery fee, tags, hero image
- **MenuItem.js** — restaurantId, name, description, price, category, image
- **Order.js** — userId, restaurantId, items[], status, total, driver info

#### [NEW] `server/routes/`
- **auth.js** — `POST /register`, `POST /login` (JWT)
- **restaurants.js** — `GET /restaurants`, `GET /restaurants/:id`
- **menu.js** — `GET /restaurants/:id/menu`
- **orders.js** — `POST /orders`, `GET /orders/:id`, `GET /orders/user/:userId`

#### [NEW] `server/seed.js`
Seeds MongoDB with sample restaurants, menu items from the design (The Gourmet Foundry, Burger Palace, Sushi Zen, Royal Spice, Morning Bliss, etc.) and a sample user.

---

### Frontend — `client/`

#### [NEW] `client/src/index.css`
Global design system with CSS variables matching the FetchFood brand:
- **Primary:** `#C0392B` (red), **Accent:** `#2D6A4F` (green for tracking)
- **Font:** Inter (Google Fonts)
- Card shadows, border radii, smooth transitions, hover effects

#### [NEW] `client/src/pages/HomePage.jsx`
- Left sidebar: FetchFood logo, nav links (Home, Explore, My Orders, Account, Settings), upgrade card
- Top bar: search input, notifications bell, user avatar + name + location
- Hero banners: "50% Off First Order" + "Fastest Delivery" cards
- Cuisine filter pills (All Foods, Fast Food, Desi, Healthy, etc.)
- Popular Restaurants grid (4 cards with rating badge, tags, delivery info)
- "Order it again" horizontal scroll row

#### [NEW] `client/src/pages/RestaurantPage.jsx`
- Full-width hero image with restaurant name, rating, cuisine tags
- Category tab bar (Most Popular, Signature Burgers, Sides & Snacks, etc.)
- 2-column menu item grid with photo, name, description, price, + button
- Fixed right-side cart panel: order items with quantity controls, subtotal, delivery fee, total, Checkout button

#### [NEW] `client/src/pages/OrderTrackingPage.jsx`
- Left panel: order number, restaurant, estimated time badge, status timeline (Order Preparing → Picked Up → Arriving Soon → Delivered), driver card with avatar/rating/vehicle, order summary
- Right panel: Leaflet map with animated dashed route, driver marker, destination marker, "Live Tracking" + distance chip

#### [NEW] `client/src/components/`
- **Sidebar.jsx** — Fixed left sidebar with nav links, upgrade promo
- **CartSidebar.jsx** — Cart panel with item list, quantity +/−, totals
- **MapView.jsx** — Leaflet map with simulated driver movement

---

## Key Design Details from Uploads

| Design Element | Implementation |
|---|---|
| Red primary `#C0392B` | CSS variable `--primary` |
| "TRENDING" badge on hero | Absolute positioned pill |
| Category pill tabs (active = red filled) | CSS `.active` class toggle |
| Cart item +/− counter | CartContext state |
| Status timeline with green check / red dot | CSS step indicator |
| Dashed red route on map | Leaflet polyline with dashArray |
| Driver avatar + rating + vehicle | Order model driver sub-document |
| "Order verified & quality checked" footer bar | Fixed bottom toast in tracking page |
| FetchPro upgrade card in sidebar | Static UI card |

---

## Verification Plan

### Automated
- `npm run dev` in both `/server` and `/client` — ensure no startup errors
- Seed script: `node seed.js` — verify data is inserted

### Manual Verification
1. Home page loads with restaurants and cuisine filters working
2. Clicking a restaurant navigates to menu page
3. Adding items updates cart sidebar in real-time
4. Order tracking page shows map with animated driver
5. Cart totals calculate correctly

---

## Open Questions

> [!IMPORTANT]
> **MongoDB**: Do you have MongoDB installed locally, or should I use **MongoDB Atlas** (cloud, free tier) with a connection string? If local, I'll assume the default `mongodb://localhost:27017/fetchfood`.

> [!NOTE]
> **Map**: I'll use **Leaflet.js** (free, no API key) with OpenStreetMap tiles for the order tracking map. The driver movement will be **simulated** (animated along a path) since real GPS requires a live backend + WebSockets.

> [!NOTE]
> **Images**: I'll use **Unsplash URLs** for food/restaurant photos to match the design aesthetic. No image hosting setup required.
