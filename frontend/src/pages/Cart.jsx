import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>Your Shopping Cart is Empty</h2>
        <p>Discover our latest arrivals and elevate your wardrobe.</p>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items-section">
          {cartItems.map((item) => {
            const primaryImage = item.product.images?.find(img => img.isPrimary)?.url || item.product.images?.[0]?.url;
            
            return (
              <div key={`${item.product._id}-${item.size}`} className="cart-item">
                <img src={primaryImage} alt={item.product.name} className="cart-item-image" />
                
                <div className="cart-item-details">
                  <Link to={`/product/${item.product.slug}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <p className="cart-item-size">Size: {item.size}</p>
                  <p className="cart-item-price">{formatCurrency(item.product.price)}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)}>+</button>
                  </div>
                  <button 
                    className="btn-remove" 
                    onClick={() => removeFromCart(item.product._id, item.size)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatCurrency(getCartTotal())}</span>
          </div>
          <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;