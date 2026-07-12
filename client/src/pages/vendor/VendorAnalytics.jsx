import { useState, useEffect, useRef } from 'react';
import { fetchVendorAnalytics } from '../../api';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="vendor-stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="vendor-stat-value" style={{ color }}>{value}</div>
      <div className="vendor-stat-label">{label}</div>
      {sub && <div className="vendor-stat-sub">{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="vendor-chart">
      <div className="vendor-chart-bars">
        {data.map((d, i) => (
          <div key={i} className="vendor-chart-col">
            <div className="vendor-chart-bar-wrap">
              <div
                className="vendor-chart-bar"
                style={{ height: `${Math.max((d.revenue / maxRev) * 100, 2)}%` }}
                title={`$${d.revenue.toFixed(2)}`}
              >
                {d.revenue > 0 && (
                  <span className="vendor-chart-val">${d.revenue.toFixed(0)}</span>
                )}
              </div>
            </div>
            <div className="vendor-chart-label">{d.date.split(' ')[0]}</div>
            <div className="vendor-chart-orders">{d.orders} orders</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorAnalytics()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="vendor-empty-state"><p>Failed to load analytics.</p></div>;

  return (
    <div>
      <div className="vendor-section-header">
        <div>
          <h2 className="vendor-section-title">Analytics</h2>
          <p className="vendor-section-sub">Revenue and order insights</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="vendor-stats-grid">
        <StatCard label="Today's Revenue" value={`$${data.todayRevenue}`} color="#C0392B" />
        <StatCard label="Total Revenue" value={`$${data.totalRevenue}`} color="#1A6B4A" />
        <StatCard label="Total Orders" value={data.totalOrders} sub={`${data.deliveredOrders} delivered`} color="#E67E22" />
        <StatCard label="Avg Order Value" value={`$${data.avgOrderValue}`} color="#8B5CF6" />
      </div>

      {/* Revenue Chart */}
      <div className="vendor-chart-card">
        <div className="vendor-chart-title">Revenue — Last 7 Days</div>
        {data.daily && data.daily.length > 0 ? (
          <BarChart data={data.daily} />
        ) : (
          <div className="vendor-empty-state">
            <p>No completed orders yet. Revenue will appear here once orders are delivered.</p>
          </div>
        )}
      </div>

      {/* Daily breakdown table */}
      {data.daily && data.daily.length > 0 && (
        <div className="vendor-chart-card" style={{ marginTop: 20 }}>
          <div className="vendor-chart-title">Daily Breakdown</div>
          <div className="vendor-menu-table">
            <div className="vendor-menu-table-head">
              <span>Day</span><span>Orders</span><span>Revenue</span>
            </div>
            {data.daily.map((d, i) => (
              <div key={i} className="vendor-menu-row">
                <span>{d.date}</span>
                <span>{d.orders}</span>
                <span style={{ color: '#1A6B4A', fontWeight: 700 }}>${d.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
