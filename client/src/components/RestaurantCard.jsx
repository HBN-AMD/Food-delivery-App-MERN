import { useNavigate } from 'react-router-dom';

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const BikeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 0 0 0-2h-3l-3 9H6"/><path d="M10 10l4 7"/>
  </svg>
);

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const badgeClass = {
    'FREE DELIVERY': 'tag-free',
    'TOP RATED': 'tag-top',
    'TRENDING': 'tag-trending',
  }[restaurant.badge] || '';

  return (
    <div
      className="restaurant-card"
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      role="button"
      tabIndex={0}
      id={`restaurant-${restaurant._id}`}
      onKeyDown={e => e.key === 'Enter' && navigate(`/restaurant/${restaurant._id}`)}
    >
      <div className="restaurant-card-img-wrap">
        <img src={restaurant.heroImage} alt={restaurant.name} loading="lazy" />
        <div className="restaurant-rating-badge">
          <StarIcon /> {restaurant.rating}
        </div>
        {restaurant.badge && (
          <div className={`restaurant-tag-badge ${badgeClass}`}>{restaurant.badge}</div>
        )}
      </div>
      <div className="restaurant-card-body">
        <div className="restaurant-card-name">{restaurant.name}</div>
        <div className="restaurant-card-cuisines">{(restaurant.cuisines || []).join(' • ')}</div>
        <div className="restaurant-card-meta">
          <span><ClockIcon /> {restaurant.deliveryTime}</span>
          <span>
            <BikeIcon />
            {restaurant.deliveryFee === 0
              ? <span className="delivery-free">Free</span>
              : `$${restaurant.deliveryFee.toFixed(2)} Fee`}
          </span>
        </div>
      </div>
    </div>
  );
}
