import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const itemsPrice = getCartTotal();
  const shippingPrice = itemsPrice > 200 ? 0 : 15; // Free shipping over $200
  const totalPrice = itemsPrice + shippingPrice;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Format cart items for the backend
      const orderItems = cartItems.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.images?.find(img => img.isPrimary)?.url || item.product.images?.[0]?.url,
        price: item.product.price,
        size: item.size,
        product: item.product._id
      }));

      const orderData = {
        orderItems,
        shippingAddress: data,
        paymentMethod: 'COD', // Defaulting to Cash on Delivery for now
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      // Send to backend
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        alert('Order placed successfully!');
        navigate('/account'); // Redirect to account dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || cartItems.length === 0) return null;

  return (
    <div className="container checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      
      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        {/* Left Side: Shipping Form */}
        <div className="checkout-form-section">
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-form" id="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                {...register('fullName', { required: 'Full name is required' })} 
                className={errors.fullName ? 'input-error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input 
                type="text" 
                {...register('address', { required: 'Address is required' })} 
                className={errors.address ? 'input-error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>City</label>
                <input 
                  type="text" 
                  {...register('city', { required: 'City is required' })} 
                  className={errors.city ? 'input-error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city.message}</span>}
              </div>

              <div className="form-group half">
                <label>Postal Code</label>
                <input 
                  type="text" 
                  {...register('postalCode', { required: 'Postal Code is required' })} 
                  className={errors.postalCode ? 'input-error' : ''}
                />
                {errors.postalCode && <span className="error-text">{errors.postalCode.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Country</label>
                <input 
                  type="text" 
                  {...register('country', { required: 'Country is required' })} 
                  className={errors.country ? 'input-error' : ''}
                />
                {errors.country && <span className="error-text">{errors.country.message}</span>}
              </div>

              <div className="form-group half">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  {...register('phone', { required: 'Phone is required' })} 
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone.message}</span>}
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="checkout-summary-section">
          <h2>Order Summary</h2>
          
          <div className="checkout-items">
            {cartItems.map(item => (
              <div key={`${item.product._id}-${item.size}`} className="checkout-item">
                <div className="item-info">
                  <span className="item-qty">{item.quantity}x</span>
                  <span className="item-name">{item.product.name} (Size: {item.size})</span>
                </div>
                <span className="item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form" 
            className="btn-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;