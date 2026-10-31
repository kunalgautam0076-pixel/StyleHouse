import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import './Checkout.css';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => {
    script.remove();
    resolve(false);
  };
  document.body.appendChild(script);
});

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const itemsPrice = getCartTotal();
  const shippingPrice = itemsPrice > 2000 ? 0 : 150;
  const totalPrice = itemsPrice + shippingPrice;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError('');
      const orderRequest = {
        cartItems: cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          size: item.size,
        })),
        shippingAddress: data,
      };

      if (paymentMethod === 'COD') {
        await api.post('/orders', orderRequest);
        clearCart();
        navigate('/account', { state: { notice: 'Your order has been placed.' } });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay Checkout could not be loaded. Check your connection and try again.');
      }

      const { data: orderResponse } = await api.post('/orders/razorpay', orderRequest);
      const paymentOrder = orderResponse.data;
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'StyleHouse',
        description: 'Secure order payment',
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: data.fullName,
          email: user.email,
          contact: data.phone,
        },
        notes: {
          orderId: paymentOrder.orderId,
        },
        theme: { color: '#1a1a1a' },
        handler: async paymentResponse => {
          try {
            await api.post('/orders/verify-payment', {
              orderId: paymentOrder.orderId,
              ...paymentResponse,
            });
            clearCart();
            navigate('/account', { state: { notice: 'Payment successful. Your order is confirmed.' } });
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message
              || 'Payment was received but could not be verified. Please contact support before retrying.'
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      });

      checkout.on('payment.failed', paymentFailure => {
        setError(paymentFailure.error?.description || 'Payment failed. Please try again.');
        setIsSubmitting(false);
      });
      checkout.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
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

            <fieldset className="payment-methods">
              <legend>Payment method</legend>
              <label className={`payment-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                />
                <span>
                  <strong>Pay online with Razorpay</strong>
                  <small>UPI, cards, net banking and supported wallets</small>
                </span>
              </label>
              <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <span>
                  <strong>Cash on delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
              </label>
            </fieldset>
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
                <span className="item-price">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(itemsPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form" 
            className="btn-place-order"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : paymentMethod === 'COD' ? 'Place Order' : `Pay ${formatCurrency(totalPrice)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;