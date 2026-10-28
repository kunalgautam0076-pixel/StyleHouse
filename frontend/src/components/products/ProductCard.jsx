import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { formatCurrency } from '../../utils/currency';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart }                    = useContext(CartContext);
  const isFavorited = isInWishlist(product._id);

  const primaryImage = product.images?.find(img => img.isPrimary)?.url
    || product.images?.[0]?.url
    || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=750&fit=crop';

  const secondaryImage = product.images?.[1]?.url || primaryImage;

  const isNew      = product.isNewArrival;
  const isSoldOut  = product.stockQuantity === 0;

  /* Quick-add: pick first available size */
  const firstSize = product.variants?.[0]?.size;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstSize) addToCart(product, firstSize, 1);
  };

  return (
    <motion.div
      className={`product-card ${isSoldOut ? 'sold-out' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      {/* Image Container */}
      <div className="product-image-container">
        <Link to={`/product/${product.slug}`} className="product-image-link" tabIndex={-1}>
          <img
            src={primaryImage}
            alt={product.name}
            className="product-image primary-image"
            loading="lazy"
          />
          <img
            src={secondaryImage}
            alt={`${product.name} alternate`}
            className="product-image secondary-image"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="product-badges">
          {isNew     && <span className="product-badge badge-new">New</span>}
          {isSoldOut && <span className="product-badge badge-sold">Sold Out</span>}
          {!isNew && !isSoldOut && product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="product-badge badge-sale">Sale</span>
          )}
        </div>

        {/* Wishlist Toggle */}
        <motion.button
          className={`wishlist-toggle-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          aria-label="Toggle Wishlist"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={isFavorited ? 'currentColor' : 'none'}
          />
        </motion.button>

        {/* Quick Add */}
        {!isSoldOut && (
          <motion.button
            className="quick-add-btn"
            onClick={handleQuickAdd}
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ opacity: 1, y: 0 }}
            aria-label="Quick add to cart"
          >
            Quick Add
          </motion.button>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {product.brand && (
          <span className="product-brand">{product.brand}</span>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price-row">
          <span className="product-price">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="product-compare-price">{formatCurrency(product.compareAtPrice)}</span>
          )}
        </div>

        {/* Color swatches if available */}
        {product.colors && product.colors.length > 0 && (
          <div className="product-swatches">
            {product.colors.slice(0, 4).map(c => (
              <span key={c} className="swatch" style={{ background: c }} title={c} />
            ))}
            {product.colors.length > 4 && (
              <span className="swatch-more">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;