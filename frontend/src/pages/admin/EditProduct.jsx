import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    compareAtPrice: '',
    description: '',
    category: '',
    brand: 'StyleHouse',
    stockQuantity: '',
    isPublished: false,
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories and product details concurrently
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products`) // Or direct lookup if you have a single product admin endpoint
        ]);

        setCategories(catRes.data.data);
        
        // Find the specific product from the list
        const product = prodRes.data.data.find(p => p._id === id);
        if (product) {
          setFormData({
            name: product.name || '',
            price: product.price || '',
            compareAtPrice: product.compareAtPrice || '',
            description: product.description || '',
            category: product.category?._id || product.category || '',
            brand: product.brand || 'StyleHouse',
            stockQuantity: product.stockQuantity || 0,
            isPublished: product.isPublished || false,
            imageUrl: product.images?.[0]?.url || ''
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const payload = {
        ...formData,
        images: [{ url: formData.imageUrl, isPrimary: true }]
      };

      await api.put(`/products/${id}`, payload);
      alert('Product updated successfully!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container status-message">Loading product...</div>;
  if (error && !formData.name) return <div className="container status-message error">{error}</div>;

  return (
    <div className="container edit-product-container">
      <div className="edit-header">
        <Link to="/admin" className="back-link">&larr; Back to Dashboard</Link>
        <h1>Edit Product</h1>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Product Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Price ($)</label>
            <input 
              type="number" 
              step="0.01" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group half">
            <label>Compare at Price ($)</label>
            <input 
              type="number" 
              step="0.01" 
              name="compareAtPrice" 
              value={formData.compareAtPrice} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group half">
            <label>Stock Quantity</label>
            <input 
              type="number" 
              name="stockQuantity" 
              value={formData.stockQuantity} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Image URL (Unsplash or direct link)</label>
          <input 
            type="text" 
            name="imageUrl" 
            value={formData.imageUrl} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="description" 
            rows="5" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              name="isPublished" 
              checked={formData.isPublished} 
              onChange={handleChange} 
            />
            Publish product (Make visible in shop catalog)
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;