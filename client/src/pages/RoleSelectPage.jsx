import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    id: 'consumer',
    title: 'Order Food',
    subtitle: 'Craving something delicious? We deliver from the best local spots.',
    btnLabel: 'Start Ordering',
    btnClass: 'role-btn-consumer',
    icon: '🍔',
    iconBg: '#C0392B',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
  },
  {
    id: 'rider',
    title: 'Deliver with Us',
    subtitle: 'Earn on your own schedule. Be the hero that brings the heat.',
    btnLabel: 'Apply Now',
    btnClass: 'role-btn-rider',
    icon: '🛵',
    iconBg: '#E67E22',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  },
  {
    id: 'vendor',
    title: 'Partner with Us',
    subtitle: 'Expand your reach. Let us handle the logistics while you cook.',
    btnLabel: 'Join Platform',
    btnClass: 'role-btn-vendor',
    icon: '🏪',
    iconBg: '#1A6B4A',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="role-select-page">
      <div className="role-select-hero">
        <div className="role-select-logo">🍴 FetchFood</div>
        <h1 className="role-select-title">Fast, fresh, and reliable.</h1>
        <p className="role-select-sub">Choose your journey with Pakistan's most energetic food platform.</p>
      </div>

      <div className="role-cards-grid">
        {ROLES.map((role) => (
          <div
            key={role.id}
            className="role-card"
            id={`role-card-${role.id}`}
            onClick={() => navigate(`/login?role=${role.id}`)}
          >
            <div className="role-card-img-wrap">
              <img src={role.image} alt={role.title} className="role-card-img" />
              <div className="role-card-icon-badge" style={{ background: role.iconBg }}>
                {role.icon}
              </div>
            </div>
            <div className="role-card-body">
              <h2 className="role-card-title">{role.title}</h2>
              <p className="role-card-sub">{role.subtitle}</p>
              <button
                className={`role-card-btn ${role.btnClass}`}
                onClick={(e) => { e.stopPropagation(); navigate(`/login?role=${role.id}`); }}
                id={`role-btn-${role.id}`}
              >
                {role.btnLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="role-select-footer">
        <p>
          Already have an account?{' '}
          <button className="role-login-link" onClick={() => navigate('/login')}>
            Log In
          </button>
        </p>
        <div className="role-footer-links">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Help Center</span>
        </div>
      </div>
    </div>
  );
}
