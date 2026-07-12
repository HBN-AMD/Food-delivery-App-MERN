import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Consumer ────────────────────────────────────────────────────────────────
export const fetchRestaurants = (cuisine, region) =>
  api.get('/restaurants', { params: { ...(cuisine && cuisine !== 'All Foods' ? { cuisine } : {}), ...(region ? { region } : {}) } });
export const fetchNearbyRestaurants = (lng, lat) =>
  api.get('/restaurants/nearby', { params: { lng, lat } });
export const fetchRestaurant = (id) => api.get(`/restaurants/${id}`);
export const fetchMenu = (id) => api.get(`/restaurants/${id}/menu`);
export const placeOrder = (data) => api.post('/orders', data);
export const fetchOrder = (id) => api.get(`/orders/${id}`);
export const fetchOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const updateProfile = (data) => api.patch('/auth/profile', data);

// ─── Vendor ──────────────────────────────────────────────────────────────────
export const fetchVendorRestaurant = () => api.get('/vendor/restaurant');
export const toggleVendorStatus = (isOpen) => api.patch('/vendor/status', { isOpen });
export const fetchVendorOrders = () => api.get('/vendor/orders');
export const updateVendorOrderStatus = (id, status) => api.patch(`/vendor/orders/${id}/status`, { status });
export const fetchVendorMenu = () => api.get('/vendor/menu');
export const addMenuItem = (data) => api.post('/vendor/menu', data);
export const updateMenuItem = (id, data) => api.patch(`/vendor/menu/${id}`, data);
export const toggleMenuItemAvailability = (id, isAvailable) => api.patch(`/vendor/menu/${id}/availability`, { isAvailable });
export const deleteMenuItem = (id) => api.delete(`/vendor/menu/${id}`);
export const fetchVendorAnalytics = () => api.get('/vendor/analytics');

// ─── Rider ────────────────────────────────────────────────────────────────────
export const toggleRiderOnline = (isOnline) => api.patch('/rider/online', { isOnline });
export const fetchRiderOrders = () => api.get('/rider/orders');
export const fetchRiderActive = () => api.get('/rider/active');
export const acceptOrder = (orderId) => api.post(`/rider/accept/${orderId}`);
export const updateRiderOrderStatus = (id, status) => api.patch(`/rider/orders/${id}/status`, { status });
export const fetchRiderEarnings = () => api.get('/rider/earnings');

export default api;
