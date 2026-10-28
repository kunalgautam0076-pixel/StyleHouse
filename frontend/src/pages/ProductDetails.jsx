import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { formatCurrency } from '../utils/currency';
import './ProductDetails.css';

const ProductDetails = () => {
  const { slug }   = useParams();
  const { addToCart }            = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity,     setQuantity]     = useState(1);
  const [activeImg,    setActiveImg]    = useState(0);
  const [added,        setAdded]        = useState(false);
  const [activeTab,    setActiveTab]    = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data);
        if (data.data.variants?.length > 0) {
          setSelectedSize(data.data.variants[0].size);
        }
      } catch {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    addToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="container pd-loading-state">
      <div className="pd-skeleton-img skeleton" />
      <div className="pd-skeleton-info">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 20, width: `${70 - i * 10}%`, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
  if (error)   return <div className="container status-message error">{error}</div>;
  if (!product) return null;

  const images        = product.images || [];
  const activeImgUrl  = images[activeImg]?.url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop';
  const availableSizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const isFavorited   = isInWishlist(product._id);
  const isSoldOut     = product.stockQuantity === 0;

  return (
    <div className="container pd-container">

      {/* Breadcrumbs */}
      <nav className="pd-breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <div className="pd-content">

        {/* ── Image Gallery ── */}
        <div className="pd-image-section">

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="pd-main-image-container">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={activeImgUrl}
                alt={product.name}
                className="pd-main-image"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>

            {isSoldOut && (
              <div className="pd-sold-out-banner">Sold Out</div>
            )}
          </div>
        </div>

        {/* ── Product Info ── */}
        <motion.div
          className="pd-info-section"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {/* Brand & Title */}
          {product.brand && <span className="pd-brand">{product.brand}</span>}
          <h1 className="pd-title">{product.name}</h1>

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="pd-compare-price">{formatCurrency(product.compareAtPrice)}</span>
                <span className="pd-discount-badge">
                  {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          <div className="pd-divider" />

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="pd-option-group">
              <div className="pd-option-header">
                <span className="pd-option-label">Size</span>
                <span className="pd-selected-value">{selectedSize}</span>
              </div>
              <div className="pd-size-grid">
                {availableSizes.map(size => (
                  <motion.button
                    key={size}
                    className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pd-option-group">
            <span className="pd-option-label">Quantity</span>
            <div className="pd-quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pd-actions">
            <motion.button
              className={`btn-add-to-cart ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isSoldOut}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="add-to-cart-inner">
                    <Check size={18} /> Added to Cart
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="add-to-cart-inner">
                    <ShoppingBag size={18} /> {isSoldOut ? 'Sold Out' : 'Add to Cart'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button
              className={`btn-wishlist ${isFavorited ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Add to wishlist"
            >
              <Heart size={20} strokeWidth={1.5} fill={isFavorited ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Value Props */}
          <div className="pd-promises">
            <div className="pd-promise">
              <Truck size={16} strokeWidth={1.5} />
              <span>Free shipping on orders over ₹2,000</span>
            </div>
            <div className="pd-promise">
              <RefreshCw size={16} strokeWidth={1.5} />
              <span>30-day easy returns</span>
            </div>
            <div className="pd-promise">
              <Shield size={16} strokeWidth={1.5} />
              <span>Secure checkout with Razorpay</span>
            </div>
          </div>

          {/* Tabs: Description / Details */}
          <div className="pd-tabs">
            <div className="pd-tab-bar">
              {['description', 'details'].map(tab => (
                <button
                  key={tab}
                  className={`pd-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="pd-tab-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'description' ? (
                  <p>{product.description}</p>
                ) : (
                  <div className="pd-meta-list">
                    {product.brand && <div className="pd-meta-row"><strong>Brand</strong><span>{product.brand}</span></div>}
                    {product.category?.name && <div className="pd-meta-row"><strong>Category</strong><span>{product.category.name}</span></div>}
                    {product.sku && <div className="pd-meta-row"><strong>SKU</strong><span>{product.sku}</span></div>}
                    <div className="pd-meta-row"><strong>Stock</strong><span>{product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}</span></div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;