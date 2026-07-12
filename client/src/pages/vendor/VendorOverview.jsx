import { fetchVendorOrders } from '../../api';
import { useEffect, useState } from 'react';

export default function VendorOverview() {
  const [stats, setStats] = useState({ new: 0, preparing: 0, ready: 0, total: 0 });

  useEffect(() => {
    fetchVendorOrders().then(res => {
      const orders = res.data;
      setStats({
        new: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        total: orders.length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="vendor-section-header">
        <div>
          <h2 className="vendor-section-title">Overview</h2>
          <p className="vendor-section-sub">Your restaurant at a glance</p>
        </div>
      </div>
      <div className="vendor-stats-grid">
        <div className="vendor-stat-card" style={{ borderTop: '4px solid #EF4444' }}>
          <div className="vendor-stat-value" style={{ color: '#EF4444' }}>{stats.new}</div>
          <div className="vendor-stat-label">New Orders</div>
        </div>
        <div className="vendor-stat-card" style={{ borderTop: '4px solid #F59E0B' }}>
          <div className="vendor-stat-value" style={{ color: '#F59E0B' }}>{stats.preparing}</div>
          <div className="vendor-stat-label">Preparing</div>
        </div>
        <div className="vendor-stat-card" style={{ borderTop: '4px solid #10B981' }}>
          <div className="vendor-stat-value" style={{ color: '#10B981' }}>{stats.ready}</div>
          <div className="vendor-stat-label">Ready for Pickup</div>
        </div>
        <div className="vendor-stat-card" style={{ borderTop: '4px solid #C0392B' }}>
          <div className="vendor-stat-value" style={{ color: '#C0392B' }}>{stats.total}</div>
          <div className="vendor-stat-label">Active Orders</div>
        </div>
      </div>
      <div className="vendor-empty-state" style={{ marginTop: 32 }}>
        <div style={{ fontSize: '3rem' }}>📊</div>
        <p>Use the <strong>Live Orders</strong> tab to manage incoming orders in real-time.</p>
      </div>
    </div>
  );
}
