import React, { useContext, useLayoutEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContext } from './context/AuthContext';

// Page Imports (Eager for auth/404)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Account = React.lazy(() => import('./pages/Account'));
const AdminDashboardController = React.lazy(() => import('./pages/admin/AdminDashboardController'));
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const EditProduct = React.lazy(() => import('./pages/admin/EditProduct'));

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/account" replace />;
  return <Outlet />;
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

const AdminIndexRedirect = () => {
  const { hash } = useLocation();
  const legacySection = hash.slice(1);
  const destination = legacySection === 'orders'
    ? 'orders'
    : legacySection === 'overview'
      ? 'overview'
      : 'products';

  return <Navigate to={destination} replace />;
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className={`app-wrapper${isAdminRoute ? ' admin-app-wrapper' : ''}`}>
      {!isAdminRoute && <Navbar />}

      <main className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p>Loading...</p></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardController />}>
                  <Route index element={<AdminIndexRedirect />} />
                  <Route path="overview" element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="product/:id/edit" element={<EditProduct />} />
                </Route>
              </Route>
              <Route path="/wishlist" element={<Wishlist />} />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;