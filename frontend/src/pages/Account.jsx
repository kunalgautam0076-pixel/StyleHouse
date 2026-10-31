import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, LogOut, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import './Account.css';

const STATUS_CLASSES = {
  'Payment Pending': 'status-pending',
  Processing:        'status-processing',
  Shipped:           'status-shipped',
  Delivered:         'status-delivered',
  Cancelled:         'status-cancelled',
};

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/myorders');
        setOrders(data.data);
      } catch {
        setError('Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container account-container">

      {/* Header */}
      <div className="account-header">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          My Account
        </motion.h1>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={1.5} style={{ marginRight: '0.4rem' }} />
          Log Out
        </button>
      </div>

      {/* Success Notice */}
      <AnimatePresence>
        {location.state?.notice && (
          <motion.div
            className="account-notice"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0, marginRight: '0.5rem' }} />
            {location.state.notice}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="account-layout">

        {/* Profile Sidebar */}
        <motion.aside
          className="account-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-card">
            <div className="profile-avatar">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </motion.aside>

        {/* Orders Main */}
        <motion.main
          className="account-main"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2>Order History</h2>

          {loading ? (
            <div className="orders-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="order-card-skeleton">
                  <div className="skeleton" style={{ height: 52, borderRadius: 4 }} />
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="skeleton" style={{ height: 16, width: '70%' }} />
                    <div className="skeleton" style={{ height: 16, width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="account-status error">{error}</p>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <Package size={48} strokeWidth={1} style={{ color: 'var(--accent-color)', opacity: 0.5, marginBottom: '1rem' }} />
              <p>You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/shop')} className="btn-secondary" style={{ marginTop: '1rem' }}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  className="order-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-id">
                        Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <span className={`order-status ${STATUS_CLASSES[order.orderStatus] || ''}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="order-items-preview">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span className="item-qty">{item.qty}×</span>
                        <span className="item-name">{item.name} (Size: {item.size})</span>
                        <span className="item-price">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <span className="order-total-label">Total</span>
                    <span className="order-total-amount">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default Account;