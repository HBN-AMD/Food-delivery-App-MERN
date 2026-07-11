import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import RestaurantCard from '../components/RestaurantCard';
import { fetchRestaurants } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CATEGORIES = [
  { label: 'All', emoji: '🍽️', cuisine: 'All Foods' },
  { label: 'Burgers', emoji: '🍔', cuisine: 'Burgers' },
  { label: 'Japanese', emoji: '🍣', cuisine: 'Japanese' },
  { label: 'Indian', emoji: '🍛', cuisine: 'Desi' },
  { label: 'Healthy', emoji: '🥗', cuisine: 'Healthy' },
  { label: 'Desserts', emoji: '🍰', cuisine: 'Desserts' },
  { label: 'Beverages', emoji: '☕', cuisine: 'Beverages' },
  { label: 'Breakfast', emoji: '🥞', cuisine: 'Breakfast' },
  { label: 'Vegan', emoji: '🌱', cuisine: 'Vegan' },
  { label: 'Fast Food', emoji: '🍟', cuisine: 'Fast Food' },
];

export default function ExplorePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All Foods');
  const [search, setSearch] = useState('');
  const containerRef = useScrollReveal();

  useEffect(() => {
    fetchRestaurants(activeCat)
      .then(res => setRestaurants(res.data))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [activeCat]);

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
          {/* Hero */}
          <div className="explore-hero reveal">
            <h1>Explore Restaurants</h1>
            <p>Discover top-rated spots across every cuisine</p>
            <div className="explore-search">
              <SearchIcon />
              <input
                id="explore-search-input"
                type="text"
                placeholder="Search cuisine, restaurant…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="section-header reveal">
            <h2 className="section-title">Browse by Category</h2>
          </div>
          <div className="pill-tabs reveal" style={{ marginBottom: 32 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.cuisine}
                className={`pill-tab${activeCat === cat.cuisine ? ' active' : ''}`}
                onClick={() => setActiveCat(cat.cuisine)}
                id={`explore-cat-${cat.label.toLowerCase()}`}
              >
                <span>{cat.emoji} {cat.label}</span>
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="section-header reveal">
            <h2 className="section-title">
              {loading ? 'Loading…' : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} found`}
            </h2>
          </div>

          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : (
          <div className="restaurant-grid">
              {filtered.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
              {!filtered.length && (
                <p style={{ color: 'var(--text-muted)', padding: '32px 0', gridColumn: '1/-1', textAlign: 'center' }}>
                  No restaurants found for that search.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
