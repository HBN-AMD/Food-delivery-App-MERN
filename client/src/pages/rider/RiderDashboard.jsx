import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toggleRiderOnline, fetchRiderOrders, acceptOrder, fetchRiderActive, fetchRiderEarnings, updateRiderOrderStatus } from '../../api';
import { connectSocket, getSocket } from '../../hooks/useSocket';

function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

// Toast notification for new order
function OrderToast({ order, onAccept, onDismiss }) {
  return (
    <div className="rider-toast" id="rider-new-order-toast">
      <div className="rider-toast-header">
        <span className="rider-toast-icon">🔔</span>
        <strong>New Order Available!</strong>
      </div>
      <div className="rider-toast-body">
        <div className="rider-toast-restaurant">{order.restaurantName}</div>
        <div className="rider-toast-meta">{order.itemCount} item(s) · ${order.total?.toFixed(2)}</div>
      </div>
      <div className="rider-toast-actions">
        <button className="rider-toast-accept" id="rider-toast-accept-btn" onClick={() => onAccept(order.orderId)}>
          ✅ Accept
        </button>
        <button className="rider-toast-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function RiderDashboard() {
  const { user, logoutUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [tab, setTab] = useState('orders'); // 'orders' | 'earnings'
  const [toast, setToast] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, activeRes, earningsRes] = await Promise.all([
        fetchRiderOrders(),
        fetchRiderActive(),
        fetchRiderEarnings(),
      ]);
      setAvailableOrders(ordersRes.data);
      setActiveDelivery(activeRes.data);
      setEarnings(earningsRes.data);
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Socket setup
  useEffect(() => {
    const socket = connectSocket();

    socket.on('new_order_available', (data) => {
      if (isOnline) {
        setToast(data);
        setAvailableOrders(prev => {
          if (prev.find(o => o._id === data.orderId)) return prev;
          return [{ _id: data.orderId, ...data }, ...prev];
        });
      }
    });

    socket.on('order_ready_for_pickup', (data) => {
      if (isOnline) setToast(data);
    });

    return () => {
      socket.off('new_order_available');
      socket.off('order_ready_for_pickup');
    };
  }, [isOnline]);

  const handleToggleOnline = async () => {
    const newVal = !isOnline;
    setIsOnline(newVal);
    try {
      await toggleRiderOnline(newVal);
      const socket = getSocket() || connectSocket();
      if (newVal) {
        socket.emit('join_region', user.region);
        loadData();
      } else {
        socket.emit('leave_region', user.region);
        setToast(null);
      }
    } catch { setIsOnline(prev => !prev); }
  };

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    setToast(null);
    try {
      const res = await acceptOrder(orderId);
      setActiveDelivery(res.data);
      setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept order');
    } finally { setAccepting(null); }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!activeDelivery) return;
    setStatusLoading(true);
    try {
      const res = await updateRiderOrderStatus(activeDelivery._id, newStatus);
      if (newStatus === 'delivered') {
        setActiveDelivery(null);
        loadData();
      } else {
        setActiveDelivery(res.data);
      }
    } catch { alert('Failed to update status'); }
    finally { setStatusLoading(false); }
  };

  return (
    <div className="rider-page">
      {/* Toast */}
      {toast && (
        <OrderToast order={toast} onAccept={handleAccept} onDismiss={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="rider-header">
        <div className="rider-header-left">
          <div className="rider-logo">🍴 FetchFood</div>
          <div className="rider-role-tag">Rider</div>
        </div>
        <button className="rider-logout" onClick={() => logoutUser()}>Sign Out</button>
      </div>

      {/* Profile card */}
      <div className="rider-profile-card">
        <div className="rider-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="rider-profile-info">
          <div className="rider-profile-name">{user?.name}</div>
          <div className="rider-profile-region">📍 {user?.region}</div>
        </div>
        <div className={`rider-status-pill ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '● Active Now' : '○ Offline'}
        </div>
      </div>

      {/* Go Online/Offline Toggle */}
      <div className="rider-online-section">
        <div className="rider-online-label">
          {isOnline ? '🟢 You are online. Ready to deliver!' : '🔴 You are offline. Go online to receive orders.'}
        </div>
        <button
          id="rider-online-toggle"
          className={`rider-online-btn ${isOnline ? 'online' : 'offline'}`}
          onClick={handleToggleOnline}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="rider-active-delivery">
          <div className="rider-active-header">
            <span className="rider-active-badge">🚴 Active Delivery</span>
            <span className="rider-active-order">#{activeDelivery.orderNumber}</span>
          </div>
          <div className="rider-active-restaurant">{activeDelivery.restaurantName}</div>
          <div className="rider-active-items">
            {activeDelivery.items?.map((item, i) => (
              <div key={i}>{item.quantity}x {item.name}</div>
            ))}
          </div>
          <div className="rider-active-address">
            <span>📍</span>
            <span>{activeDelivery.deliveryAddress || 'Delivery address not provided'}</span>
          </div>
          <div className="rider-active-total">Total: ${activeDelivery.total?.toFixed(2)}</div>

          {activeDelivery.status === 'accepted' ? (
            <button
              className="rider-action-btn rider-pickup-btn"
              id="rider-pickup-btn"
              disabled={statusLoading}
              onClick={() => handleStatusUpdate('picked_up')}
            >
              {statusLoading ? 'Updating…' : '📦 Mark as Picked Up'}
            </button>
          ) : (
            <button
              className="rider-action-btn rider-deliver-btn"
              id="rider-deliver-btn"
              disabled={statusLoading}
              onClick={() => handleStatusUpdate('delivered')}
            >
              {statusLoading ? 'Updating…' : '✅ Mark as Delivered'}
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="rider-tabs">
        <button className={`rider-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          Available Orders {availableOrders.length > 0 && <span className="rider-tab-badge">{availableOrders.length}</span>}
        </button>
        <button className={`rider-tab ${tab === 'earnings' ? 'active' : ''}`} onClick={() => setTab('earnings')}>
          Earnings
        </button>
      </div>

      {/* Available Orders List */}
      {tab === 'orders' && (
        <div className="rider-orders-list">
          {!isOnline ? (
            <div className="rider-offline-msg">Go online to see available orders in {user?.region}</div>
          ) : availableOrders.length === 0 ? (
            <div className="rider-offline-msg">No orders available in {user?.region} right now. Check back soon!</div>
          ) : (
            availableOrders.map(order => (
              <div key={order._id} className="rider-order-card" id={`rider-order-${order._id}`}>
                <div className="rider-order-header">
                  <span className="rider-order-restaurant">{order.restaurantName}</span>
                  <span className="rider-order-time">{timeAgo(order.createdAt)}</span>
                </div>
                <div className="rider-order-meta">
                  {order.items?.length} item(s) · ${order.total?.toFixed(2)} ·
                  <span className="rider-order-fee"> +${order.deliveryFee?.toFixed(2)} fee</span>
                </div>
                <div className="rider-order-address">📍 {order.deliveryAddress || 'Address on pickup'}</div>
                <button
                  className="rider-accept-btn"
                  id={`rider-accept-${order._id}`}
                  disabled={accepting === order._id || !!activeDelivery}
                  onClick={() => handleAccept(order._id)}
                >
                  {accepting === order._id ? 'Accepting…' : activeDelivery ? 'Finish current delivery first' : 'Accept Order'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Earnings Tab */}
      {tab === 'earnings' && earnings && (
        <div className="rider-earnings">
          <div className="rider-earnings-grid">
            <div className="rider-earnings-card">
              <div className="rider-earnings-value">${earnings.todayEarnings}</div>
              <div className="rider-earnings-label">Today's Earnings</div>
            </div>
            <div className="rider-earnings-card">
              <div className="rider-earnings-value">{earnings.todayDeliveries}</div>
              <div className="rider-earnings-label">Today's Deliveries</div>
            </div>
            <div className="rider-earnings-card" style={{ gridColumn: '1/-1' }}>
              <div className="rider-earnings-value">${earnings.totalEarnings}</div>
              <div className="rider-earnings-label">All-Time Earnings ({earnings.totalDeliveries} trips)</div>
            </div>
          </div>

          {earnings.recent?.length > 0 && (
            <div className="rider-earnings-history">
              <div className="vendor-chart-title">Recent Trips</div>
              {earnings.recent.map((o, i) => (
                <div key={i} className="rider-trip-row">
                  <span>Delivery fee</span>
                  <span style={{ color: '#1A6B4A', fontWeight: 700 }}>+${o.deliveryFee?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
