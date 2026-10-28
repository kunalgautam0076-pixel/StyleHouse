import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { WishlistContext } from '../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const isFavorited = isInWishlist(product._id);

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${product.slug}`} className="product-image-link">
          <img src={primaryImage} alt={product.name} className="product-image" loading="lazy" />
        </Link>
        
        <button 
          className={`wishlist-toggle-btn ${isFavorited ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-label="Wishlist toggle"
        >
          <Heart size={18} strokeWidth={1.5} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        {product.stockQuantity === 0 && <span className="product-badge sold-out">Sold Out</span>}
      </div>
      
      <div className="product-info">
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price-container">
          <span className="product-price">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;