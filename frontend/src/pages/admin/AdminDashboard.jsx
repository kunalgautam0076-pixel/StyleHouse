import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formError, setFormError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    brand: 'StyleHouse',
    stockQuantity: '0',
    imageUrl: '',
    isPublished: false,
  });

  async function fetchAdminData() {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(productsResponse.data.data);
      setCategories(categoriesResponse.data.data);
    } catch {
      setError('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }
  
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

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    try {
      setIsSavingProduct(true);
      setFormError('');
      const { data } = await api.post('/products', {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        compareAtPrice: newProduct.compareAtPrice ? Number(newProduct.compareAtPrice) : undefined,
        category: newProduct.category,
        brand: newProduct.brand,
        stockQuantity: Number(newProduct.stockQuantity),
        images: [{ url: newProduct.imageUrl, isPrimary: true }],
        isPublished: newProduct.isPublished,
      });
      setProducts(currentProducts => [data.data, ...currentProducts]);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        category: '',
        brand: 'StyleHouse',
        stockQuantity: '0',
        imageUrl: '',
        isPublished: false,
      });
      setShowAddProduct(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setIsSavingProduct(false);
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
        <button
          onClick={() => {
            setShowAddProduct(open => !open);
            setFormError('');
          }}
          className="btn-primary"
        >
          {showAddProduct ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {showAddProduct && (
        <section className="admin-section add-product-section">
          <h2>Add Product</h2>
          {formError && <div className="admin-error">{formError}</div>}
          {categories.length === 0 ? (
            <p className="admin-status">Create an active category before adding products.</p>
          ) : (
            <form className="add-product-form" onSubmit={handleCreateProduct}>
              <div className="add-product-grid">
                <label>
                  Product name
                  <input
                    name="name"
                    value={newProduct.name}
                    onChange={event => setNewProduct({ ...newProduct, name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Brand
                  <input
                    name="brand"
                    value={newProduct.brand}
                    onChange={event => setNewProduct({ ...newProduct, brand: event.target.value })}
                  />
                </label>
                <label>
                  Price ($)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={event => setNewProduct({ ...newProduct, price: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Compare-at price ($)
                  <input
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProduct.compareAtPrice}
                    onChange={event => setNewProduct({ ...newProduct, compareAtPrice: event.target.value })}
                  />
                </label>
                <label>
                  Category
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={event => setNewProduct({ ...newProduct, category: event.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Stock quantity
                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value={newProduct.stockQuantity}
                    onChange={event => setNewProduct({ ...newProduct, stockQuantity: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-wide">
                  Image URL
                  <input
                    name="imageUrl"
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={event => setNewProduct({ ...newProduct, imageUrl: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-wide">
                  Description
                  <textarea
                    name="description"
                    rows="4"
                    value={newProduct.description}
                    onChange={event => setNewProduct({ ...newProduct, description: event.target.value })}
                    required
                  />
                </label>
                <label className="add-product-publish">
                  <input
                    type="checkbox"
                    checked={newProduct.isPublished}
                    onChange={event => setNewProduct({ ...newProduct, isPublished: event.target.checked })}
                  />
                  Publish product immediately
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={isSavingProduct}>
                {isSavingProduct ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          )}
        </section>
      )}

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