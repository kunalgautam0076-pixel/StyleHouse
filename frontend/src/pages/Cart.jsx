import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import './Cart.css';

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const primaryImage = item.product.images?.find(img => img.isPrimary)?.url || item.product.images?.[0]?.url;

  return (
    <motion.div
      className="cart-item"
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${item.product.slug}`} className="cart-item-image-link">
        <img src={primaryImage} alt={item.product.name} className="cart-item-image" />
      </Link>

      <div className="cart-item-details">
        <Link to={`/product/${item.product.slug}`} className="cart-item-name">
          {item.product.name}
        </Link>
        {item.product.brand && <span className="cart-item-brand">{item.product.brand}</span>}
        <span className="cart-item-meta">Size: <strong>{item.size}</strong></span>
        <span className="cart-item-unit-price">{formatCurrency(item.product.price)} each</span>
      </div>

      <div className="cart-item-right">
        <div className="cart-item-actions">
          <div className="quantity-controls">
            <button
              onClick={() => updateQuantity(item.product._id, item.size, item.quantity - 1)}
              aria-label="Decrease"
              className="qty-btn"
            >
              <Minus size={13} />
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product._id, item.size, item.quantity + 1)}
              aria-label="Increase"
              className="qty-btn"
            >
              <Plus size={13} />
            </button>
          </div>
          <button
            className="btn-remove"
            onClick={() => removeFromCart(item.product._id, item.size)}
            aria-label="Remove item"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>

        <span className="cart-item-subtotal">
          {formatCurrency(item.product.price * item.quantity)}
        </span>
      </div>
    </motion.div>
  );
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const total    = getCartTotal();
  const shipping = total > 2000 ? 0 : 150;

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <motion.div
          className="cart-empty-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cart-empty-icon">
            <ShoppingBag size={52} strokeWidth={1} />
          </div>
          <h2>Your Cart is Empty</h2>
          <p>Discover our latest arrivals and elevate your wardrobe.</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <motion.h1
        className="cart-page-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart
        <span className="cart-count">({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
      </motion.h1>

      <div className="cart-layout">

        {/* Items */}
        <div className="cart-items-section">
          <AnimatePresence initial={false}>
            {cartItems.map(item => (
              <CartItem
                key={`${item.product._id}-${item.size}`}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <motion.div
          className="cart-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'free-shipping' : ''}>
                {shipping === 0 ? 'Free' : formatCurrency(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="shipping-hint">
                Add {formatCurrency(2000 - total)} more for free shipping
              </p>
            )}
            <div className="summary-divider" />
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total + shipping)}</span>
            </div>
          </div>

          <Link to="/checkout" className="btn-checkout">
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="continue-shopping-link">
            ← Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;