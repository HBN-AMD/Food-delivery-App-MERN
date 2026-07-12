import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RestaurantCard from '../components/RestaurantCard';
import { fetchRestaurants, fetchNearbyRestaurants, fetchOrders } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CUISINES = ['All Foods', 'Fast Food', 'Desi', 'Healthy', 'Desserts', 'Beverages', 'Sushi', 'Vegan'];



const CartIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const BoltIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCuisine, setActiveCuisine] = useState('All Foods');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const containerRef = useScrollReveal();
  const [recentOrders, setRecentOrders] = useState([]);

  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading' | 'granted' | 'denied'

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('granted');
        fetchNearbyRestaurants(position.coords.longitude, position.coords.latitude)
          .then(res => setRestaurants(res.data))
          .catch(() => setRestaurants([]))
          .finally(() => setLoading(false));
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Fallback to region-based query if geolocation is denied or while activeCuisine changes
  useEffect(() => {
    if (locationStatus === 'denied') {
      setLoading(true);
      fetchRestaurants(activeCuisine, user?.region)
        .then(res => setRestaurants(res.data))
        .catch(() => setRestaurants([]))
        .finally(() => setLoading(false));
    }
  }, [activeCuisine, user?.region, locationStatus]);

  useEffect(() => {
    if (user) {
      fetchOrders()
        .then(res => setRecentOrders(res.data.slice(0, 4)))
        .catch(err => console.error('Failed to fetch orders', err));
    }
  }, [user]);

  const filtered = search
    ? restaurants.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisines.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    : restaurants;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar onSearch={setSearch} />
        <main className="page-content page-enter" ref={containerRef}>

          {/* ── Hero Banners ── */}
          <div className="hero-grid reveal">
            <div className="hero-banner">
              <img
                className="hero-banner-img"
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&h=500&fit=crop"
                alt="50% Off Promotion"
              />
              <div className="hero-banner-overlay" />
              <div className="hero-banner-content">
                <span className="flash-badge">⚡ Flash Sale</span>
                <h2>50% Off Your<br />First Order</h2>
                <p>Valid on all Italian & Continental restaurants today.</p>
                <button className="btn-claim" onClick={() => navigate('/explore')}>Claim Offer <ArrowIcon /></button>
              </div>
            </div>
            <div className="hero-green-card">
              <div>
                <h3>Fastest Delivery</h3>
                <p>Get food at your doorstep in under 20 minutes.</p>
              </div>
              <div className="priority-badge">
                <BoltIcon /> Priority Fetch Active
              </div>
            </div>
          </div>

          {/* ── Cuisine Filters ── */}
          <div className="section-header reveal">
            <h2 className="section-title">Cuisines you love</h2>
            <a href="/explore" className="view-all" onClick={e => { e.preventDefault(); navigate('/explore'); }}>
              View All <ArrowIcon />
            </a>
          </div>
          <div className="pill-tabs reveal" style={{ marginBottom: 36 }}>
            {CUISINES.map(c => (
              <button
                key={c}
                className={`pill-tab${activeCuisine === c ? ' active' : ''}`}
                onClick={() => setActiveCuisine(c)}
                id={`cuisine-${c.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>

          {/* ── Popular Restaurants ── */}
          <div className="section-header reveal">
            <h2 className="section-title">Popular Restaurants</h2>
            <button className="view-all" onClick={() => navigate('/explore')}>
              See all <ArrowIcon />
            </button>
          </div>

          {loading ? (
            <div className="restaurant-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="restaurant-card" style={{ opacity: 0.5 }}>
                  <div style={{ background: '#e5e7eb', height: 180, width: '100%' }}></div>
                  <div style={{ padding: 16 }}>
                    <div style={{ background: '#e5e7eb', height: 20, width: '60%', marginBottom: 8 }}></div>
                    <div style={{ background: '#e5e7eb', height: 16, width: '40%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="restaurant-grid">
              {filtered.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', padding: '32px 0', textAlign: 'center' }}>
                  No restaurants found. Make sure the server is running.
                </p>
              )}
            </div>
          )}

          {recentOrders.length > 0 && (
            <>
              <div className="section-header reveal" style={{ marginTop: 8 }}>
                <h2 className="section-title">Order it again</h2>
              </div>
              <div className="order-again-row reveal">
                {recentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  if (!firstItem) return null;
                  return (
                    <div key={order._id} className="order-again-card" id={`reorder-${order._id}`}>
                      <img className="order-again-img" src={firstItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop'} alt={firstItem.name} />
                      <div className="order-again-info">
                        <div className="order-again-name">{firstItem.name}</div>
                        <div className="order-again-rest">{order.restaurantName} · {new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button className="order-again-btn" aria-label="Add to cart" onClick={() => addItem(firstItem, order.restaurant, order.restaurantName)}>
                        <CartIcon />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Bottom padding */}
          <div style={{ height: 40 }} />
        </main>
      </div>
    </div>
  );
}
