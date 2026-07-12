import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchVendorOrders, updateVendorOrderStatus } from '../../api';

const COLUMNS = [
  { key: 'pending',   label: 'New',             dot: '#EF4444', btnLabel: 'Accept Order',  nextStatus: 'preparing' },
  { key: 'preparing', label: 'Preparing',        dot: '#F59E0B', btnLabel: 'Mark Ready',    nextStatus: 'ready' },
  { key: 'ready',     label: 'Ready for Pickup', dot: '#10B981', btnLabel: 'Hand Over',     nextStatus: null },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

function OrderCard({ order, column, onAction }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!column.nextStatus) return;
    setLoading(true);
    try { await onAction(order._id, column.nextStatus); }
    finally { setLoading(false); }
  };

  return (
    <div className={`vendor-order-card ${column.key === 'ready' ? 'vendor-order-card--ready' : ''}`}
      id={`order-card-${order._id}`}>
      <div className="vendor-order-card-header">
        <span className="vendor-order-num">#{order.orderNumber}</span>
        <span className="vendor-order-time">{timeAgo(order.createdAt)}</span>
      </div>
      <div className="vendor-order-customer">{order.deliveryAddress || 'Customer'}</div>
      <ul className="vendor-order-items">
        {order.items.map((item, i) => (
          <li key={i}>{item.quantity}x {item.name}</li>
        ))}
      </ul>
      <div className="vendor-order-total">${order.total?.toFixed(2)}</div>
      {column.nextStatus && (
        <button
          className={`vendor-order-btn ${column.key === 'pending' ? 'vendor-order-btn--accept' : 'vendor-order-btn--ready'}`}
          onClick={handleAction}
          disabled={loading}
          id={`order-action-${order._id}`}
        >
          {loading ? 'Updating…' : column.btnLabel}
        </button>
      )}
      {column.key === 'ready' && (
        <div className="vendor-order-awaiting">⏳ Awaiting rider pickup</div>
      )}
    </div>
  );
}

export default function VendorLiveOrders() {
  const { socketRef } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetchVendorOrders();
      setOrders(res.data);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadOrders();
    // Poll every 15s as fallback
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Real-time: listen for new orders via socket
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handleNewOrder = (order) => {
      setOrders(prev => {
        if (prev.find(o => o._id === order._id)) return prev;
        return [order, ...prev];
      });
    };

    const handleStatusUpdate = ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o)
        .filter(o => ['pending', 'preparing', 'ready'].includes(o.status)));
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update', handleStatusUpdate);
    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [socketRef]);

  const handleAction = async (orderId, newStatus) => {
    await updateVendorOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  };

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = orders.filter(o => o.status === col.key);
    return acc;
  }, {});

  return (
    <div>
      <div className="vendor-section-header">
        <div>
          <h2 className="vendor-section-title">Live Orders</h2>
          <p className="vendor-section-sub">Real-time order management</p>
        </div>
        <div className="vendor-live-badge">
          <span className="vendor-live-dot" />
          LIVE
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div className="vendor-kanban">
          {COLUMNS.map(col => (
            <div key={col.key} className="vendor-kanban-col">
              <div className="vendor-kanban-col-header">
                <span className="vendor-kanban-dot" style={{ background: col.dot }} />
                <span className="vendor-kanban-label">{col.label}</span>
                <span className="vendor-kanban-count">{grouped[col.key].length}</span>
              </div>
              <div className="vendor-kanban-cards">
                {grouped[col.key].length === 0 ? (
                  <div className="vendor-kanban-empty">No orders here</div>
                ) : (
                  grouped[col.key].map(order => (
                    <OrderCard key={order._id} order={order} column={col} onAction={handleAction} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
