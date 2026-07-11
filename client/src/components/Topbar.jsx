import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

/* ───── Icons ───── */
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

/* ───── Notifications data ───── */
const NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    emoji: '🛵',
    title: 'Your order is on the way!',
    body: 'Khalid is 1.2 miles away from you.',
    time: '2 min ago',
    unread: true,
    color: '#FEF3C7',
  },
  {
    id: 2,
    type: 'promo',
    emoji: '🎉',
    title: '50% off your next order',
    body: 'Use code FETCH50 before midnight tonight.',
    time: '1 hr ago',
    unread: true,
    color: '#FFF5F5',
  },
  {
    id: 3,
    type: 'order',
    emoji: '✅',
    title: 'Order delivered successfully!',
    body: 'Your Sushi Zen order was delivered. Rate your experience.',
    time: '3 hr ago',
    unread: false,
    color: '#F0FDF4',
  },
  {
    id: 4,
    type: 'promo',
    emoji: '⭐',
    title: 'New restaurant nearby',
    body: 'The Gourmet Foundry just joined FetchFood.',
    time: 'Yesterday',
    unread: false,
    color: '#EEF2FF',
  },
  {
    id: 5,
    type: 'system',
    emoji: '🔐',
    title: 'Security notice',
    body: 'Your password was changed successfully.',
    time: '2 days ago',
    unread: false,
    color: '#F9FAFB',
  },
];

/* ───── Reusable outside-click hook ───── */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

export default function Topbar({ onSearch }) {
  const { user, logoutUser } = useAuth();
  const { toggleMobileMenu } = useUI();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useOutsideClick(notifRef, () => setShowNotifs(false));
  useOutsideClick(profileRef, () => setShowProfile(false));

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const unreadCount = notifs.filter(n => n.unread).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

  const toggleNotifs = () => {
    setShowNotifs(v => !v);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(v => !v);
    setShowNotifs(false);
  };

  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
      <div className="topbar-left-mobile">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Menu">
          <MenuIcon />
        </button>
        <div className="topbar-logo">FetchFood</div>
      </div>

      {/* Search */}
      <div className="topbar-search">
        <span className="topbar-search-icon"><SearchIcon /></span>
        <input
          id="search-input"
          type="text"
          placeholder="Search for 'Spicy Biryani' or 'Burger King'…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
        />
      </div>

      <div className="topbar-right">
        {/* Notification bell */}
        <div className="topbar-notif-wrap" ref={notifRef}>
          <button
            id="notif-bell-btn"
            className={`topbar-notif${showNotifs ? ' active' : ''}`}
            aria-label="Notifications"
            onClick={toggleNotifs}
          >
            <BellIcon />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span className="notif-dropdown-title">
                  Notifications
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifs.map(n => (
                  <div
                    key={n.id}
                    className={`notif-item${n.unread ? ' unread' : ''}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="notif-icon" style={{ background: n.color }}>{n.emoji}</div>
                    <div className="notif-content">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-body">{n.body}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>
                    {n.unread && <div className="notif-unread-dot" />}
                  </div>
                ))}
              </div>
              <div className="notif-dropdown-footer">
                <button onClick={() => { setShowNotifs(false); }}>
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            id="profile-menu-btn"
            className={`topbar-user${showProfile ? ' active' : ''}`}
            onClick={toggleProfile}
            aria-label="User menu"
          >
            <div className="topbar-user-info">
              <div className="topbar-user-name">{user?.name || 'Alex Johnson'}</div>
              <div className="topbar-user-loc">{user?.location || 'Dubai, UAE'}</div>
            </div>
            <img
              className="topbar-avatar"
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
              alt="User avatar"
            />
            <span className="topbar-chevron"><ChevronDown /></span>
          </button>

          {/* Profile dropdown */}
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <img
                  className="profile-dropdown-avatar"
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'}
                  alt="avatar"
                />
                <div>
                  <div className="profile-dropdown-name">{user?.name || 'Alex Johnson'}</div>
                  <div className="profile-dropdown-email">{user?.email || 'alex@fetchfood.com'}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <div className="profile-dropdown-list">
                {[
                  { emoji: '👤', label: 'My Account', path: '/account' },
                  { emoji: '📦', label: 'My Orders', path: '/orders' },
                  { emoji: '❤️', label: 'Favourites', path: '/explore' },
                  { emoji: '⚙️', label: 'Settings', path: '/settings' },
                ].map(item => (
                  <button
                    key={item.path}
                    className="profile-dropdown-item"
                    onClick={() => { navigate(item.path); setShowProfile(false); }}
                    id={`profile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="profile-item-emoji">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-signout"
                id="profile-signout-btn"
                onClick={() => { logoutUser(); setShowProfile(false); }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
