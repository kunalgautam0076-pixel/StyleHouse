import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);

  if (wishlistItems.length === 0) {
    return (
      <div className="container wishlist-empty">
        <h2>Your Wishlist is Empty</h2>
        <p>Save items you love while shopping to review them later.</p>
        <Link to="/shop" className="btn-primary">Explore Shop</Link>
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <h1>My Wishlist ({wishlistItems.length})</h1>

      <div className="wishlist-grid">
        {wishlistItems.map((product) => {
          const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;

          return (
            <div key={product._id} className="wishlist-card">
              <button 
                className="wishlist-remove-btn" 
                onClick={() => removeFromWishlist(product._id)}
                aria-label="Remove from wishlist"
              >
                <Trash2 size={18} strokeWidth={1.5} />
              </button>

              <Link to={`/product/${product.slug}`} className="wishlist-image-container">
                <img src={primaryImage} alt={product.name} className="wishlist-image" />
              </Link>

              <div className="wishlist-info">
                <Link to={`/product/${product.slug}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="wishlist-price">{formatCurrency(product.price)}</p>
                <Link to={`/product/${product.slug}`} className="btn-view-product">
                  <ShoppingBag size={16} strokeWidth={1.5} /> View & Select Size
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;