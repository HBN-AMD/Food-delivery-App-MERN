import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchVendorRestaurant, toggleVendorStatus } from '../../api';
import { useSocket } from '../../hooks/useSocket';
import { useUI } from '../../context/UIContext';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const NAV = [
  { to: '/vendor', label: 'Overview', icon: '📊', end: true },
  { to: '/vendor/orders', label: 'Live Orders', icon: '🍽️' },
  { to: '/vendor/menu', label: 'Menu Editor', icon: '🔧' },
  { to: '/vendor/analytics', label: 'Analytics', icon: '📈' },
];

export default function VendorDashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUI();
  const [restaurant, setRestaurant] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const socketRef = useSocket(user);

  useEffect(() => {
    fetchVendorRestaurant()
      .then(res => { setRestaurant(res.data); setIsOpen(res.data.isOpen); })
      .catch(() => {});
  }, []);

  const handleToggle = async () => {
    try {
      const newVal = !isOpen;
      setIsOpen(newVal);
      await toggleVendorStatus(newVal);
    } catch { setIsOpen(prev => !prev); }
  };

  return (
    <div className="vendor-layout">
      {/* Sidebar */}
      <aside className={`vendor-sidebar sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="vendor-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="vendor-brand-icon">🍴</div>
            <div>
              <div className="vendor-brand-name">{restaurant?.name || 'My Restaurant'}</div>
              <div className="vendor-brand-sub">Partner Dashboard</div>
            </div>
          </div>
          <button type="button" className="sidebar-close-btn" onClick={closeMobileMenu} aria-label="Close menu" style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
            <CloseIcon />
          </button>
        </div>

        <nav className="vendor-nav">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              onClick={closeMobileMenu}
              className={({ isActive }) => `vendor-nav-link ${isActive ? 'active' : ''}`}
              id={`vendor-nav-${item.label.toLowerCase().replace(' ', '-')}`}>
              <span className="vendor-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="vendor-sidebar-footer">
          <button className="vendor-support-btn" onClick={() => window.location.href = 'mailto:support@fetchfood.com'}>❓ Support</button>
        </div>
      </aside>

      {/* Main area */}
      <div className="vendor-main">
        {/* Topbar */}
        <header className="vendor-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Open menu">
              <MenuIcon />
            </button>
            <h1 className="vendor-topbar-title" id="vendor-page-title">
              {NAV.find(n => location.pathname === n.to || (!n.end && location.pathname.startsWith(n.to)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="vendor-topbar-right">
            {/* Accepting Orders Toggle */}
            <div className="vendor-toggle-wrap">
              <span className="vendor-toggle-label">Accepting Orders</span>
              <button
                id="vendor-accepting-toggle"
                className={`vendor-toggle ${isOpen ? 'on' : ''}`}
                onClick={handleToggle}
                aria-label="Toggle accepting orders"
              />
            </div>
            <button className="vendor-avatar-btn" onClick={() => { logoutUser(); navigate('/'); }}>
              <div className="vendor-avatar">{user?.name?.[0]?.toUpperCase() || 'V'}</div>
            </button>
          </div>
        </header>

        <div className="vendor-content">
          <Outlet context={{ restaurant, socketRef }} />
        </div>
      </div>
    </div>
  );
}
