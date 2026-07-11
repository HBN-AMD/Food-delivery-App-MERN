import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { placeOrder } from '../api';

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const BagIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, subtotal, deliveryFee, total, itemCount, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const orderItems = items.map(i => ({
        menuItem: i._id,
        name: i.name,
        price: i.price,
        quantity: i.qty,
        image: i.image,
      }));
      const res = await placeOrder({
        restaurantId,
        restaurantName,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress: user?.location || '123 Main St, San Francisco, CA',
      });
      clearCart();
      navigate(`/track/${res.data._id}`);
    } catch (err) {
      alert('Could not place order. Is the server running?');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <aside className="cart-sidebar">
      <div className="cart-header">
        <div className="cart-title">
          Your Order
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </div>
        {items.length > 0 && (
          <button className="cart-clear" onClick={clearCart}>Clear all</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <BagIcon />
          <p>Your cart is empty.<br />Add items from the menu.</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item._id} className="cart-item">
                <img className="cart-item-img" src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-notes">Regular size</div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQty(item._id, -1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._id, 1)}>+</button>
                    <button className="cart-item-remove" onClick={() => removeItem(item._id)}>Remove</button>
                  </div>
                </div>
                <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="cart-row"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
            <div className="cart-total-row"><span>Total</span><span className="cart-total-amount">${total.toFixed(2)}</span></div>
            <button className="checkout-btn" id="checkout-btn" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? 'Processing...' : 'Checkout'} {!isCheckingOut && <ArrowIcon />}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
