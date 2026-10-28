import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Account.css';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/myorders');
        setOrders(data.data);
      } catch (err) {
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
      <div className="account-header">
        <h1>My Account</h1>
        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="account-layout">
        {/* Profile Sidebar */}
        <aside className="account-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </aside>

        {/* Order History */}
        <main className="account-main">
          <h2>Order History</h2>
          
          {loading ? (
            <p className="account-status">Loading your orders...</p>
          ) : error ? (
            <p className="account-status error">{error}</p>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/shop')} className="btn-secondary">Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-meta">
                      <span className="order-id">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`order-status status-${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="order-items-preview">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="order-item-row">
                        <span className="item-qty">{item.qty}x</span>
                        <span className="item-name">{item.name} (Size: {item.size})</span>
                        <span className="item-price">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Account;