import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';

// Consumer pages
import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import MyOrdersPage from './pages/MyOrdersPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import RoleSelectPage from './pages/RoleSelectPage';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOverview from './pages/vendor/VendorOverview';
import VendorLiveOrders from './pages/vendor/VendorLiveOrders';
import VendorMenuEditor from './pages/vendor/VendorMenuEditor';
import VendorAnalytics from './pages/vendor/VendorAnalytics';

// Rider pages
import RiderDashboard from './pages/rider/RiderDashboard';

// Route Guards
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard for their role
    if (user.role === 'vendor') return <Navigate to="/vendor" replace />;
    if (user.role === 'rider') return <Navigate to="/rider" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  // After login redirect based on role
  const getHome = () => {
    if (!user) return <RoleSelectPage />;
    if (user.role === 'vendor') return <Navigate to="/vendor" replace />;
    if (user.role === 'rider') return <Navigate to="/rider" replace />;
    return <Navigate to="/home" replace />;
  };

  return (
    <Routes>
      {/* Landing / Role Select */}
      <Route path="/" element={getHome()} />

      {/* Auth */}
      <Route path="/login" element={user ? (
        user.role === 'vendor' ? <Navigate to="/vendor" replace /> :
        user.role === 'rider'  ? <Navigate to="/rider" replace />  :
        <Navigate to="/home" replace />
      ) : <AuthPage />} />

      {/* Consumer App */}
      <Route path="/home" element={<ProtectedRoute requiredRole="consumer"><HomePage /></ProtectedRoute>} />
      <Route path="/restaurant/:id" element={<ProtectedRoute requiredRole="consumer"><RestaurantPage /></ProtectedRoute>} />
      <Route path="/track/:id" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute requiredRole="consumer"><ExplorePage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute requiredRole="consumer"><MyOrdersPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute requiredRole="consumer"><AccountPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute requiredRole="consumer"><SettingsPage /></ProtectedRoute>} />

      {/* Vendor Portal */}
      <Route path="/vendor" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>}>
        <Route index element={<VendorOverview />} />
        <Route path="orders" element={<VendorLiveOrders />} />
        <Route path="menu" element={<VendorMenuEditor />} />
        <Route path="analytics" element={<VendorAnalytics />} />
      </Route>

      {/* Rider App */}
      <Route path="/rider" element={<ProtectedRoute requiredRole="rider"><RiderDashboard /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
