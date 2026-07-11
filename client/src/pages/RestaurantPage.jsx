import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItemCard from '../components/MenuItemCard';
import CartSidebar from '../components/CartSidebar';
import { fetchRestaurant, fetchMenu } from '../api';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState({ items: [], grouped: {} });
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          fetchRestaurant(id),
          fetchMenu(id),
        ]);
        setRestaurant(restRes.data);
        setMenuData(menuRes.data);
        const cats = Object.keys(menuRes.data.grouped);
        if (cats.length) setActiveCategory(cats[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--primary)' }}>{error}</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="restaurant-page">
        <div className="restaurant-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="spinner"></div>
        </div>
        <CartSidebar />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Restaurant not found.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const categories = Object.keys(menuData.grouped);
  const displayItems = activeCategory ? (menuData.grouped[activeCategory] || []) : menuData.items;

  return (
    <div className="restaurant-page">
      <div className="restaurant-main">
        {/* Hero */}
        <div className="restaurant-hero">
          <img src={restaurant.heroImage} alt={restaurant.name} />
          <div className="restaurant-hero-overlay" />
          <div className="restaurant-hero-content">
            {restaurant.badge && <span className="trending-pill">{restaurant.badge}</span>}
            <div className="restaurant-hero-rating">
              <StarIcon />
              <span>{restaurant.rating} ({restaurant.reviewCount}+ Ratings)</span>
              <span>•</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
            <h1>{restaurant.name}</h1>
            <div className="restaurant-hero-tags">{(restaurant.tags || []).join(' • ')}</div>
          </div>
        </div>

        {/* Category nav */}
        <nav className="restaurant-nav" aria-label="Menu categories">
          <button className="restaurant-nav-back" onClick={() => navigate('/')}>
            <BackIcon /> FetchFood
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`restaurant-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Menu grid */}
        <section className="menu-section">
          <div className="menu-grid">
            {displayItems.map(item => (
              <MenuItemCard
                key={item._id}
                item={item}
                restaurantId={restaurant._id}
                restaurantName={restaurant.name}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Cart sidebar */}
      <CartSidebar />
    </div>
  );
}
