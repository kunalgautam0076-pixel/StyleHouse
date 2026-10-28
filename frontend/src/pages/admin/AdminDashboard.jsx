import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NEW: Add a small delay to wait for AuthContext to fetch the user
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait for 800ms to allow AuthContext to restore the user session
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Protect route
  useEffect(() => {
    if (isCheckingAuth) return; // Do nothing while waiting for auth check

    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      alert(`Access denied. Your current role is: "${user.role}". You must be an "admin" in MongoDB.`);
      navigate('/account');
      return;
    }

    fetchAdminData();
  }, [user, isCheckingAuth, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data.data);
    } catch (err) {
      setError('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const { data } = await api.post('/products');
      setProducts([data.data, ...products]);
      alert('Blank sample product created! You can now edit its details.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Show a loading screen while waiting for the auth check
  if (isCheckingAuth) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <h2>Verifying Admin Credentials...</h2>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="container admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your store inventory and catalog</p>
        </div>
        <button onClick={handleCreateProduct} className="btn-primary">
          + Add New Product
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-section">
        <h2>Product Inventory ({products.length})</h2>

        {loading ? (
          <p className="admin-status">Loading inventory...</p>
        ) : products.length === 0 ? (
          <p className="admin-status">No products found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td className="product-cell">
                      <img 
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                        alt={product.name} 
                        className="admin-thumb"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td>{product.category?.name || 'Unassigned'}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.isPublished ? 'published' : 'draft'}`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btns">
                        <button 
                          onClick={() => navigate(`/admin/product/${product._id}/edit`)} 
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;