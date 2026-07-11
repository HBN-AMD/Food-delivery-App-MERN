import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem('cart_restaurant_id') || null);
  const [restaurantName, setRestaurantName] = useState(() => localStorage.getItem('cart_restaurant_name') || '');

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem('cart_restaurant_id', restaurantId);
    } else {
      localStorage.removeItem('cart_restaurant_id');
    }
    if (restaurantName) {
      localStorage.setItem('cart_restaurant_name', restaurantName);
    } else {
      localStorage.removeItem('cart_restaurant_name');
    }
  }, [items, restaurantId, restaurantName]);

  const addItem = (item, restId, restName) => {
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm('Your cart has items from another restaurant. Clear cart and add this item?')) return;
      setItems([]);
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(i => i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = items.length > 0 ? (subtotal > 30 ? 0 : 2.99) : 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, restaurantId, restaurantName,
      addItem, removeItem, updateQty, clearCart,
      subtotal, deliveryFee, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
