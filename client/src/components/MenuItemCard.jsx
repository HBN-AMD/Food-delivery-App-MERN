import { useCart } from '../context/CartContext';

export default function MenuItemCard({ item, restaurantId, restaurantName }) {
  const { addItem } = useCart();

  return (
    <div className="menu-item-card" id={`menu-item-${item._id}`}>
      <img
        className="menu-item-img"
        src={item.image}
        alt={item.name}
        loading="lazy"
      />
      <div className="menu-item-info">
        <div className="menu-item-name">{item.name}</div>
        <div className="menu-item-desc">{item.description}</div>
        <div className="menu-item-footer">
          <span className="menu-item-price">${item.price.toFixed(2)}</span>
          <button
            className="menu-item-add"
            aria-label={`Add ${item.name} to cart`}
            onClick={() => addItem(item, restaurantId, restaurantName)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
