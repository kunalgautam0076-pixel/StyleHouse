import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart }                          = useContext(CartContext);

  const handleMoveToCart = (product) => {
    const firstSize = product.variants?.[0]?.size;
    if (firstSize) addToCart(product, firstSize, 1);
    removeFromWishlist(product._id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-empty">
        <motion.div
          className="wishlist-empty-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="wishlist-empty-icon">
            <Heart size={52} strokeWidth={1} />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Save items you love while browsing to find them here.</p>
          <Link to="/shop" className="btn-primary">
            Explore Shop <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <motion.h1
        className="wishlist-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Wishlist
        <span className="wishlist-count">({wishlistItems.length} items)</span>
      </motion.h1>

      <AnimatePresence initial={false}>
        <div className="wishlist-grid">
          {wishlistItems.map(product => {
            const primaryImage = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
            return (
              <motion.div
                key={product._id}
                className="wishlist-card"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  className="wishlist-remove-btn"
                  onClick={() => removeFromWishlist(product._id)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>

                <Link to={`/product/${product.slug}`} className="wishlist-image-container">
                  <img src={primaryImage} alt={product.name} className="wishlist-image" />
                </Link>

                <div className="wishlist-info">
                  {product.brand && <span className="wishlist-brand">{product.brand}</span>}
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="wishlist-name">{product.name}</h3>
                  </Link>
                  <p className="wishlist-price">{formatCurrency(product.price)}</p>

                  <div className="wishlist-actions">
                    <button
                      className="wishlist-cart-btn"
                      onClick={() => handleMoveToCart(product)}
                    >
                      <ShoppingBag size={14} strokeWidth={1.5} />
                      Move to Cart
                    </button>
                    <Link to={`/product/${product.slug}`} className="wishlist-view-btn">
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;