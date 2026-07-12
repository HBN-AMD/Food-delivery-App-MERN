import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import useScrollReveal from '../hooks/useScrollReveal';

import { updateProfile } from '../api';

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function AccountPage() {
  const { user, loginUser, logoutUser } = useAuth();
  const containerRef = useScrollReveal();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(form);
      loginUser(res.data.user, res.data.token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content page-enter" ref={containerRef}>
          {/* Profile header */}
          <div className="account-header reveal">
            <div className="account-avatar-wrap">
              <img
                className="account-avatar"
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop'}
                alt="Profile"
              />
              <div className="account-avatar-edit"><EditIcon /></div>
            </div>
            <div className="account-header-info">
              <h2>{form.name}</h2>
              <p>{form.email} · {form.location}</p>
              <div className="account-badges">
                <span className="account-badge">⭐ 4.9 Rating</span>
                <span className="account-badge">🍔 47 Orders</span>
                <span className="account-badge">🎉 Member since 2023</span>
              </div>
            </div>
          </div>

          <div className="account-grid">
            {/* Personal Info */}
            <div className="account-section reveal reveal-delay-1">
              <h3>Personal Information</h3>
              <form onSubmit={handleSave}>
                <div className="account-field">
                  <label htmlFor="acc-name">Full Name</label>
                  <input id="acc-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="account-field">
                  <label htmlFor="acc-email">Email</label>
                  <input id="acc-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="account-field">
                  <label htmlFor="acc-phone">Phone</label>
                  <input id="acc-phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="account-field">
                  <label htmlFor="acc-location">Location</label>
                  <input id="acc-location" type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <button className="save-btn" type="submit">
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Saved Addresses */}
            <div className="account-section reveal reveal-delay-2">
              <h3>Saved Addresses</h3>
              {[
                { label: 'Home', addr: '45 Marina Tower, Dubai Marina, Dubai, UAE', icon: '🏠' },
                { label: 'Work', addr: 'DIFC Gate Building, Financial Centre, Dubai', icon: '🏢' },
              ].map(({ label, addr, icon }) => (
                <div key={label} style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{addr}</div>
                  </div>
                </div>
              ))}
              <button style={{
                width: '100%',
                padding: '10px',
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                fontSize: '0.88rem',
                fontWeight: 600,
                transition: 'all 0.22s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                + Add New Address
              </button>
            </div>

            {/* Payment Methods */}
            <div className="account-section reveal reveal-delay-3">
              <h3>Payment Methods</h3>
              {[
                { type: 'Visa', last4: '4242', expires: '12/26', icon: '💳', color: '#1A1A6E' },
                { type: 'Apple Pay', last4: null, expires: null, icon: '🍎', color: '#000' },
              ].map(card => (
                <div key={card.type} style={{
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{card.type}</div>
                    {card.last4 && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>•••• {card.last4} · Expires {card.expires}</div>}
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '99px', fontWeight: 700 }}>Default</span>
                </div>
              ))}
            </div>

            {/* Account Actions */}
            <div className="account-section reveal reveal-delay-4">
              <h3>Account</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Change Password', icon: '🔒' },
                  { label: 'Privacy Settings', icon: '🛡️' },
                  { label: 'Notifications', icon: '🔔' },
                  { label: 'Help & Support', icon: '💬' },
                ].map(item => (
                  <button key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'none'; }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
                <button
                  onClick={logoutUser}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FFF5F5',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    width: '100%',
                    transition: 'all var(--transition)',
                    marginTop: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; e.currentTarget.style.color = 'var(--primary)'; }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
