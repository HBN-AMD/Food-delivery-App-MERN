import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import useScrollReveal from '../hooks/useScrollReveal';

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SETTINGS_SECTIONS = [
  {
    title: 'App Preferences',
    items: [
      { icon: '🔔', title: 'Push Notifications', sub: 'Orders, deals & updates', toggle: true, defaultOn: true },
      { icon: '🌙', title: 'Dark Mode', sub: 'Switch to dark theme', toggle: true, defaultOn: false },
      { icon: '📍', title: 'Location Services', sub: 'Auto-detect your address', toggle: true, defaultOn: true },
      { icon: '🌍', title: 'Language', sub: 'English (US)', toggle: false },
    ],
  },
  {
    title: 'Delivery',
    items: [
      { icon: '⚡', title: 'Priority Fetch', sub: 'Get faster delivery slots', toggle: true, defaultOn: false },
      { icon: '🛵', title: 'Contactless Delivery', sub: 'Leave at door by default', toggle: true, defaultOn: true },
      { icon: '📦', title: 'Delivery Instructions', sub: 'Add default delivery notes', toggle: false },
    ],
  },
  {
    title: 'Payments',
    items: [
      { icon: '💳', title: 'Saved Cards', sub: 'Manage payment methods', toggle: false },
      { icon: '🎁', title: 'Promo Codes', sub: 'View & add discount codes', toggle: false },
      { icon: '🔁', title: 'Auto-Reorder', sub: 'Schedule repeat orders', toggle: true, defaultOn: false },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { icon: '🔒', title: 'Two-Factor Auth', sub: 'Extra login security', toggle: true, defaultOn: false },
      { icon: '🕵️', title: 'Activity Tracking', sub: 'Personalize recommendations', toggle: true, defaultOn: true },
      { icon: '🗑️', title: 'Delete Account', sub: 'Permanently remove your data', toggle: false, danger: true },
    ],
  },
];

function ToggleSwitch({ on, onChange }) {
  return (
    <div className={`toggle${on ? ' on' : ''}`} onClick={onChange} role="switch" aria-checked={on} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onChange()} />
  );
}

export default function SettingsPage() {
  const containerRef = useScrollReveal();
  const [toggles, setToggles] = useState(() => {
    const init = {};
    SETTINGS_SECTIONS.forEach(s => s.items.forEach(item => {
      if (item.toggle) {
        const saved = localStorage.getItem(`setting_${item.title}`);
        init[item.title] = saved !== null ? JSON.parse(saved) : (item.defaultOn ?? false);
      }
    }));
    return init;
  });

  const flip = (key) => {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`setting_${key}`, JSON.stringify(next[key]));
      
      // Handle global dark mode immediately on toggle
      if (key === 'Dark Mode') {
        document.documentElement.classList.toggle('dark', next[key]);
      }
      return next;
    });
  };

  let delayIdx = 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content page-enter" ref={containerRef}>
          {/* Header */}
          <div className="reveal" style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Manage your preferences and account settings</p>
          </div>

          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: 28 }}>
              <div className="section-header reveal">
                <h2 className="section-title">{section.title}</h2>
              </div>
              <div className="settings-list">
                {section.items.map((item) => {
                  delayIdx++;
                  return (
                    <div
                      key={item.title}
                      className="settings-item reveal"
                      style={{
                        animationDelay: `${delayIdx * 0.05}s`,
                        borderColor: item.danger ? '#FCA5A5' : undefined,
                      }}
                      id={`setting-${item.title.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <div className="settings-item-left">
                        <div className="settings-icon" style={{ background: item.danger ? '#FFF5F5' : 'var(--bg-light)', fontSize: '1.3rem' }}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="settings-item-title" style={{ color: item.danger ? 'var(--primary)' : undefined }}>{item.title}</div>
                          <div className="settings-item-sub">{item.sub}</div>
                        </div>
                      </div>
                      {item.toggle ? (
                        <ToggleSwitch on={toggles[item.title]} onChange={() => flip(item.title)} />
                      ) : (
                        <div className="settings-arrow"><ChevronRight /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* App info */}
          <div className="reveal" style={{ textAlign: 'center', padding: '20px 0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            FetchFood v1.0.0 · Made with ❤️
          </div>
        </main>
      </div>
    </div>
  );
}
