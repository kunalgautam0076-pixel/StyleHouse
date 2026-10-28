import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  // Get the primary image or fallback to a placeholder
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-image-container">
        <img src={primaryImage} alt={product.name} className="product-image" loading="lazy" />
        {product.stockQuantity === 0 && <span className="product-badge sold-out">Sold Out</span>}
        {product.compareAtPrice > product.price && <span className="product-badge sale">Sale</span>}
      </Link>
      
      <div className="product-info">
        <Link to={`/product/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price-container">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {product.compareAtPrice > product.price && (
            <span className="product-compare-price">${product.compareAtPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;