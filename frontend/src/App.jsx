import React, { useContext, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthContext } from './context/AuthContext';

// Page Imports
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboardController from './pages/admin/AdminDashboardController';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import EditProduct from './pages/admin/EditProduct';
import Wishlist from './pages/Wishlist';

const AdminRoute = () => {
  const { user } = useContext(AuthContext);

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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