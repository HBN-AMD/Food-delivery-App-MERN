import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MapView from '../components/MapView';
import { fetchOrder } from '../api';

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.5 19.79 19.79 0 0 1 1.56 4.62 2 2 0 0 1 3.53 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const NavigateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

const STATUS_STEPS = [
  { key: 'preparing', label: 'Order Preparing', sub: 'Chef is assembling your meal • 12:15 PM' },
  { key: 'picked_up', label: 'Picked Up', sub: 'Michael has collected your order • 12:32 PM' },
  { key: 'arriving', label: 'Arriving Soon', sub: 'The driver is 1.2 miles away' },
  { key: 'delivered', label: 'Delivered', sub: 'Enjoy your delicious meal' },
];

const STATUS_ORDER = ['preparing', 'picked_up', 'arriving', 'delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchOrder(id);
        setOrder(res.data);
      } catch {
        // demo fallback
        setOrder({
          orderNumber: 'FF-82910',
          restaurantName: 'Burger Palace',
          estimatedDelivery: '12:45 PM',
          status: 'arriving',
          items: [
            { name: '2x Signature Burger', price: 24.00, quantity: 2 },
            { name: '1x Truffle Fries', price: 7.50, quantity: 1 },
          ],
          subtotal: 31.50,
          tax: 2.75,
          total: 34.25,
          driver: {
            name: 'Michael J.',
            rating: 4.9,
            vehicle: 'Riding a Red Scooter',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
            distanceMiles: 1.2,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="loading-page"><div className="spinner"></div></div>;
  }

  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);

  const getStepStatus = (stepKey) => {
    const stepIdx = STATUS_ORDER.indexOf(stepKey);
    if (stepIdx < currentStatusIdx) return 'done';
    if (stepIdx === currentStatusIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="tracking-page">
      {/* Left Panel */}
      <div className="tracking-panel">
        {/* Top bar */}
        <div className="tracking-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate('/')} style={{ color: 'var(--text-secondary)' }}><BackIcon /></button>
            <span className="tracking-topbar-logo">FetchFood</span>
          </div>
          <nav className="tracking-topbar-nav">
            <Link to="#" className="active">Track Order</Link>
            <Link to="/orders">Order History</Link>
            <Link to="#">Help Center</Link>
          </nav>
        </div>

        {/* Order info */}
        <div className="tracking-header">
          <div className="tracking-order-number">
            ORDER #{order.orderNumber}
            <span className="arriving-badge">Arriving in 12m</span>
          </div>
          <div className="tracking-rest-name">{order.restaurantName}</div>
          <div className="tracking-eta">
            <ClockIcon /> Estimated Delivery: {order.estimatedDelivery}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          {STATUS_STEPS.map((step) => {
            const status = getStepStatus(step.key);
            return (
              <div key={step.key} className={`timeline-step ${status}`}>
                <div className={`timeline-dot ${status}`}>
                  {status === 'done' && <CheckIcon />}
                  {status === 'current' && <span style={{ width: 10, height: 10, background: '#fff', borderRadius: '50%', display: 'block' }}></span>}
                </div>
                <div className="timeline-step-info">
                  <div className={`timeline-step-title ${status}`}>{step.label}</div>
                  <div className="timeline-step-sub" style={status === 'pending' ? { opacity: 0.5 } : {}}>
                    {step.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Driver card */}
        {order.driver && (
          <div className="driver-card">
            <img className="driver-avatar" src={order.driver.avatar} alt={order.driver.name} />
            <div className="driver-info">
              <div className="driver-name">{order.driver.name}</div>
              <div className="driver-rating-row">⭐ {order.driver.rating} • Top Rated Driver</div>
              <div className="driver-vehicle">{order.driver.vehicle}</div>
            </div>
            <div className="driver-actions">
              <button className="driver-action-btn" aria-label="Call driver"><PhoneIcon /></button>
              <button className="driver-action-btn" aria-label="Chat with driver"><ChatIcon /></button>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {order.items.map((item, i) => (
            <div key={i} className="order-summary-item">
              <span>{item.name}</span>
              <span>${(item.price).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-summary-total">
            <span>Total (Incl. Tax)</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Quality badge */}
        <div className="quality-badge">
          <ShieldIcon />
          Order verified &amp; quality checked
        </div>
      </div>

      {/* Map */}
      <div className="tracking-map-area">
        <div className="map-chip">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot"></span> Live Tracking
          </span>
          <span style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <NavigateIcon /> {order.driver?.distanceMiles || 1.2} miles away
          </span>
        </div>
        <MapView />
      </div>
    </div>
  );
}
