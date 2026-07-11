import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { fetchOrders } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

const DEMO_ORDERS = [
  {
    _id: 'demo1',
    orderNumber: 'FF-80001',
    restaurantName: 'Burger Palace',
    items: [{ name: '2x Signature Burger' }, { name: '1x Truffle Fries' }],
    total: 34.25,
    status: 'arriving',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop',
  },
  {
    _id: 'demo2',
    orderNumber: 'FF-79982',
    restaurantName: 'Sushi Zen',
    items: [{ name: '1x Dragon Roll' }, { name: '1x Salmon Sashimi' }],
    total: 34.00,
    status: 'delivered',
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=80&h=80&fit=crop',
  },
  {
    _id: 'demo3',
    orderNumber: 'FF-79950',
    restaurantName: 'Royal Spice',
    items: [{ name: '1x Butter Chicken' }, { name: '2x Garlic Naan' }],
    total: 24.97,
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=80&h=80&fit=crop',
  },
  {
    _id: 'demo4',
    orderNumber: 'FF-79841',
    restaurantName: 'Morning Bliss',
    items: [{ name: '2x Blueberry Pancakes' }, { name: '1x Cold Brew' }],
    total: 31.97,
    status: 'delivered',
    createdAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop',
  },
  {
    _id: 'demo5',
    orderNumber: 'FF-79700',
    restaurantName: 'Pizza Hut',
    items: [{ name: '1x Pepperoni Feast' }, { name: '1x Garlic Breadsticks' }],
    total: 20.98,
    status: 'delivered',
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop',
  },
];

const STATUS_MAP = {
  preparing:  { label: 'Preparing',     className: 'status-preparing' },
  picked_up:  { label: 'Picked Up',     className: 'status-arriving' },
  arriving:   { label: 'On the Way',    className: 'status-arriving' },
  delivered:  { label: 'Delivered',     className: 'status-delivered' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const containerRef = useScrollReveal();

  useEffect(() => {
    fetchOrders()
      .then(res => {
        const all = [...(res.data || []), ...DEMO_ORDERS];
        setOrders(all);
      })
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter(o => o.status !== 'delivered');
  const past = orders.filter(o => o.status === 'delivered');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content page-enter" ref={containerRef}>
          {/* Active orders */}
          {active.length > 0 && (
            <>
              <div className="section-header reveal">
                <h2 className="section-title">Active Orders</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{active.length} order{active.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="orders-list" style={{ marginBottom: 36 }}>
                {active.map((order, i) => (
                  <div
                    key={order._id}
                    className="order-card reveal"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    onClick={() => navigate(`/track/${order._id}`)}
                  >
                    <img className="order-card-img" src={order.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop'} alt={order.restaurantName} />
                    <div className="order-card-info">
                      <div className="order-card-name">{order.restaurantName}</div>
                      <div className="order-card-meta">
                        {order.items.slice(0, 2).map(i => i.name).join(' • ')}
                        {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                      </div>
                      <span className={`order-status-pill ${STATUS_MAP[order.status]?.className}`}>
                        <TruckIcon /> {STATUS_MAP[order.status]?.label}
                      </span>
                    </div>
                    <div className="order-card-action">
                      <div className="order-card-total">${order.total?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{timeAgo(order.createdAt)}</div>
                      <button className="track-btn" onClick={e => { e.stopPropagation(); navigate(`/track/${order._id}`); }}>
                        Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Past orders */}
          <div className="section-header reveal">
            <h2 className="section-title">Order History</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{past.length} orders</span>
          </div>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : (
            <div className="orders-list">
              {past.map((order, i) => (
                <div
                  key={order._id}
                  className="order-card reveal"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <img className="order-card-img" src={order.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop'} alt={order.restaurantName} />
                  <div className="order-card-info">
                    <div className="order-card-name">{order.restaurantName}</div>
                    <div className="order-card-meta">#{order.orderNumber} • {timeAgo(order.createdAt)}</div>
                    <div className="order-card-meta" style={{ marginTop: 2 }}>
                      {order.items.slice(0, 2).map(i => i.name).join(' • ')}
                    </div>
                    <span className="order-status-pill status-delivered">
                      <CheckIcon /> Delivered
                    </span>
                  </div>
                  <div className="order-card-action">
                    <div className="order-card-total">${order.total?.toFixed(2)}</div>
                    <button className="reorder-btn" onClick={e => {
                      e.stopPropagation();
                      if (order.restaurant) {
                        const restId = typeof order.restaurant === 'object' ? order.restaurant._id : order.restaurant;
                        navigate(`/restaurant/${restId}`);
                      } else {
                        navigate('/explore');
                      }
                    }}>Reorder</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
