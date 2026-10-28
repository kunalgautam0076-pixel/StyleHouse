import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import './ProductDetails.css';

const ProductDetails = () => {
  const { slug } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data);
        
        // Auto-select the first available size if variants exist
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedSize(data.data.variants[0].size);
        }
      } catch (err) {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    
    // Actually add the item to the global cart
    addToCart(product, selectedSize, quantity);
  };

  if (loading) return <div className="container status-message">Loading product details...</div>;
  if (error) return <div className="container status-message error">{error}</div>;
  if (!product) return null;

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;
  
  // Extract unique sizes from variants
  const availableSizes = [...new Set(product.variants.map(v => v.size))];

  return (
    <div className="container pd-container">
      {/* Breadcrumbs */}
      <nav className="pd-breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
      </nav>

      <div className="pd-content">
        {/* Product Image Gallery */}
        <div className="pd-image-section">
          <div className="pd-main-image-container">
            <img src={primaryImage} alt={product.name} className="pd-main-image" />
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="pd-info-section">
          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-price">{formatCurrency(product.price)}</p>
          
          <div className="pd-description">
            <p>{product.description}</p>
          </div>

          <div className="pd-options">
            <div className="pd-option-group">
              <span className="pd-option-label">Size: <span className="pd-selected-value">{selectedSize}</span></span>
              <div className="pd-size-grid">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pd-option-group">
              <span className="pd-option-label">Quantity</span>
              <div className="pd-quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>

          <button className="btn-add-to-cart" onClick={handleAddToCart}>
            Add to Cart
          </button>
          
          <div className="pd-meta">
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Category:</strong> {product.category?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;