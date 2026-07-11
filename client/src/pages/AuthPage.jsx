import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api';

export default function AuthPage() {
  const { loginUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: 'alex@fetchfood.com', password: 'password123', location: 'Dubai, UAE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = isLogin ? login : register;
      const res = await fn(form);
      loginUser(res.data.user, res.data.token);
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
        <h2>{isLogin ? 'Welcome back!' : 'Create account'}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                className="form-input"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-location">Location</label>
              <input
                id="auth-location"
                className="form-input"
                type="text"
                placeholder="Dubai, UAE"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>
          )}
          <button className="auth-submit" type="submit" id="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
        {isLogin && (
          <div style={{ marginTop: 14, textAlign: 'center', padding: '10px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 Demo: <strong>alex@fetchfood.com</strong> / <strong>password123</strong>
          </div>
        )}
      </div>
    </div>
  );
}
