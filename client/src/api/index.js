import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchRestaurants = (cuisine) =>
  api.get('/restaurants', { params: cuisine && cuisine !== 'All Foods' ? { cuisine } : {} });

export const fetchRestaurant = (id) => api.get(`/restaurants/${id}`);
export const fetchMenu = (id) => api.get(`/restaurants/${id}/menu`);
export const placeOrder = (data) => api.post('/orders', data);
export const fetchOrder = (id) => api.get(`/orders/${id}`);
export const fetchOrders = () => api.get('/orders');
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

export default api;
