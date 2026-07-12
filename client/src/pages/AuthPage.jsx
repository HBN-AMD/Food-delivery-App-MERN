import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api';

const REGIONS = ['Islamabad', 'Peshawar', 'Lahore', 'Karachi', 'Rawalpindi', 'Dubai'];

const ROLE_LABELS = {
  consumer: { title: 'Consumer Account', emoji: '🍔', color: '#C0392B' },
  rider:    { title: 'Rider Account',    emoji: '🛵', color: '#E67E22' },
  vendor:   { title: 'Vendor Account',   emoji: '🏪', color: '#1A6B4A' },
};

export default function AuthPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromURL = searchParams.get('role') || 'consumer';

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: roleFromURL === 'consumer' ? 'alex@fetchfood.com' : '',
    password: roleFromURL === 'consumer' ? 'password123' : '',
    location: 'Islamabad',
    role: roleFromURL,
    region: 'Islamabad',
    restaurantName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleInfo = ROLE_LABELS[form.role] || ROLE_LABELS.consumer;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = isLogin ? login : register;
      const res = await fn(form);
      const { user, token } = res.data;
      loginUser(user, token);

      // Route based on role
      if (user.role === 'vendor') navigate('/vendor');
      else if (user.role === 'rider') navigate('/rider');
      else navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">FetchFood</div>
        <div className="auth-tagline">Delicious food, delivered fast 🍔</div>

        {/* Role badge */}
        <div className="auth-role-badge" style={{ background: roleInfo.color + '18', borderColor: roleInfo.color + '44', color: roleInfo.color }}>
          <span>{roleInfo.emoji}</span>
          <span>{roleInfo.title}</span>
        </div>

        <h2>{isLogin ? 'Welcome back!' : 'Create account'}</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input id="auth-name" className="form-input" type="text" placeholder="Your name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-region">Region / City</label>
                <select id="auth-region" className="form-input" value={form.region}
                  onChange={e => setForm({ ...form, region: e.target.value, location: e.target.value })}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {form.role === 'vendor' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-restaurant">Restaurant Name</label>
                  <input id="auth-restaurant" className="form-input" type="text" placeholder="e.g. The Gourmet Kitchen"
                    value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })} required />
                </div>
              )}

              {/* Role selector (hidden if set from URL) */}
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <div className="auth-role-tabs">
                  {Object.entries(ROLE_LABELS).map(([key, val]) => (
                    <button key={key} type="button"
                      className={`auth-role-tab ${form.role === key ? 'active' : ''}`}
                      style={form.role === key ? { borderColor: val.color, color: val.color, background: val.color + '14' } : {}}
                      onClick={() => setForm({ ...form, role: key })}>
                      {val.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button className="auth-submit" type="submit" id="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign up' : 'Sign in'}</button>
        </div>

        {isLogin && form.role === 'consumer' && (
          <div style={{ marginTop: 14, textAlign: 'center', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Demo: <strong>alex@fetchfood.com</strong> / <strong>password123</strong>
          </div>
        )}

        <button className="auth-back-link" onClick={() => navigate('/')}>← Back to home</button>
      </div>
    </div>
  );
}
