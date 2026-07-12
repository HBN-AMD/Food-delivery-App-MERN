import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import useScrollReveal from '../hooks/useScrollReveal';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function ToggleSwitch({ on, onChange }) {
  return (
    <div className={`toggle${on ? ' on' : ''}`} onClick={onChange} role="switch" aria-checked={on} tabIndex={0} onKeyDown={e => e.key === 'Enter' && onChange()} />
  );
}

export default function SettingsPage() {
  const containerRef = useScrollReveal();
  const { t, i18n } = useTranslation();
  const { user, loginUser, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [toggles, setToggles] = useState(() => {
    return {
      'Push Notifications': localStorage.getItem('setting_Push Notifications') !== 'false',
      'Dark Mode': localStorage.getItem('setting_Dark Mode') === 'true',
      'Location Services': localStorage.getItem('setting_Location Services') !== 'false',
      'Priority Fetch': localStorage.getItem('setting_Priority Fetch') === 'true',
      'Contactless Delivery': localStorage.getItem('setting_Contactless Delivery') !== 'false',
      'Auto-Reorder': localStorage.getItem('setting_Auto-Reorder') === 'true',
      'Two-Factor Auth': localStorage.getItem('setting_Two-Factor Auth') === 'true',
      'Activity Tracking': localStorage.getItem('setting_Activity Tracking') !== 'false',
    };
  });

  const [activeModal, setActiveModal] = useState(null);

  const SETTINGS_SECTIONS = [
    {
      title: t('app_preferences'),
      items: [
        { key: 'Push Notifications', icon: '🔔', title: t('push_notifications'), sub: t('push_sub'), toggle: true },
        { key: 'Dark Mode', icon: '🌙', title: t('dark_mode'), sub: t('dark_sub'), toggle: true },
        { key: 'Location Services', icon: '📍', title: t('location_services'), sub: t('location_sub'), toggle: true },
        { key: 'Language', icon: '🌍', title: t('language'), sub: i18n.language === 'es' ? t('spanish') : t('english'), toggle: false, action: () => setActiveModal('language') },
      ],
    },
    {
      title: t('delivery'),
      items: [
        { key: 'Priority Fetch', icon: '⚡', title: t('priority_fetch'), sub: t('priority_sub'), toggle: true },
        { key: 'Contactless Delivery', icon: '🛵', title: t('contactless'), sub: t('contactless_sub'), toggle: true },
        { key: 'Delivery Instructions', icon: '📦', title: t('delivery_instructions'), sub: t('delivery_instructions_sub'), toggle: false, action: () => setActiveModal('instructions') },
      ],
    },
    {
      title: t('payments'),
      items: [
        { key: 'Saved Cards', icon: '💳', title: t('saved_cards'), sub: t('saved_cards_sub'), toggle: false, action: () => setActiveModal('cards') },
        { key: 'Promo Codes', icon: '🎁', title: t('promo_codes'), sub: t('promo_sub'), toggle: false, action: () => setActiveModal('promo') },
        { key: 'Auto-Reorder', icon: '🔁', title: t('auto_reorder'), sub: t('auto_reorder_sub'), toggle: true },
      ],
    },
    {
      title: t('privacy_security'),
      items: [
        { key: 'Two-Factor Auth', icon: '🔒', title: t('two_factor'), sub: t('two_factor_sub'), toggle: true },
        { key: 'Activity Tracking', icon: '🕵️', title: t('activity_tracking'), sub: t('activity_sub'), toggle: true },
        { key: 'Delete Account', icon: '🗑️', title: t('delete_account'), sub: t('delete_sub'), toggle: false, danger: true, action: () => setActiveModal('delete') },
      ],
    },
  ];

  const flip = (key) => {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`setting_${key}`, JSON.stringify(next[key]));
      if (key === 'Dark Mode') {
        document.documentElement.classList.toggle('dark', next[key]);
      }
      return next;
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setActiveModal(null);
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      logoutUser();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  let delayIdx = 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content page-enter" ref={containerRef}>
          <div className="reveal" style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>{t('settings')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{t('manage_preferences')}</p>
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
                      key={item.key}
                      className="settings-item reveal"
                      style={{
                        animationDelay: `${delayIdx * 0.05}s`,
                        borderColor: item.danger ? '#FCA5A5' : undefined,
                        cursor: item.action ? 'pointer' : 'default'
                      }}
                      onClick={item.action}
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
                        <div onClick={e => e.stopPropagation()}>
                          <ToggleSwitch on={toggles[item.key]} onChange={() => flip(item.key)} />
                        </div>
                      ) : (
                        <div className="settings-arrow"><ChevronRight /></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="reveal" style={{ textAlign: 'center', padding: '20px 0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            FetchFood v1.0.0 · Made with ❤️
          </div>
        </main>
      </div>

      {/* Language Modal */}
      {activeModal === 'language' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('select_language')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button className="btn-secondary" onClick={() => changeLanguage('en')}>{t('english')}</button>
              <button className="btn-secondary" onClick={() => changeLanguage('es')}>{t('spanish')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Instructions Modal */}
      {activeModal === 'instructions' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('delivery_instructions')}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>{t('delivery_instructions_sub')}</p>
            <textarea placeholder="e.g. Leave at door, ring bell..." style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}></textarea>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setActiveModal(null)}>Save</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActiveModal(null)}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Cards Modal */}
      {activeModal === 'cards' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('saved_cards')}</h3>
            <div style={{ border: '1px solid var(--border)', padding: 16, borderRadius: 8, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>💳</span>
              <div>
                <div style={{ fontWeight: 600 }}>Visa ending in 4242</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expires 12/26</div>
              </div>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={() => setActiveModal(null)}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Promo Codes Modal */}
      {activeModal === 'promo' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t('promo_codes')}</h3>
            <input type="text" placeholder="Enter promo code" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)', marginTop: 16 }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setActiveModal(null)}>Apply</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActiveModal(null)}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {activeModal === 'delete' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--primary)' }}>{t('delete_account')}</h3>
            <p style={{ marginTop: 16 }}>Are you absolutely sure you want to delete your account? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--primary)' }} onClick={handleDeleteAccount}>{t('delete_account')}</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActiveModal(null)}>{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
