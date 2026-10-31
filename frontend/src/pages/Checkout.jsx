import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import { lookupIndianPincode } from '../utils/pincode';
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
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { country: 'India' },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [pincodeStatus, setPincodeStatus] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(postalCode)) {
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setPincodeStatus('Looking up your city and state…');
      try {
        const location = await lookupIndianPincode(postalCode, { signal: controller.signal });
        setValue('city', location.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', location.state, { shouldValidate: true, shouldDirty: true });
        setValue('country', location.country, { shouldValidate: true, shouldDirty: true });
        setPincodeStatus(`Address found: ${location.city}, ${location.state}.`);
      } catch (lookupError) {
        if (lookupError.name !== 'AbortError') {
          setPincodeStatus(lookupError.message || 'Unable to look up this PIN code.');
        }
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [postalCode, setValue]);

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

            <div className="form-row form-row--address">
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
                <label>State</label>
                <input
                  type="text"
                  {...register('state', { required: 'State is required' })}
                  className={errors.state ? 'input-error' : ''}
                />
                {errors.state && <span className="error-text">{errors.state.message}</span>}
              </div>

              <div className="form-group half">
                <label>PIN Code</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  {...register('postalCode', {
                    required: 'PIN code is required',
                    pattern: { value: /^[1-9]\d{5}$/, message: 'Enter a valid 6-digit Indian PIN code' },
                    onChange: event => {
                      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
                      setPostalCode(event.target.value);
                      setPincodeStatus('');
                    },
                  })}
                  className={errors.postalCode ? 'input-error' : ''}
                />
                {errors.postalCode && <span className="error-text">{errors.postalCode.message}</span>}
              </div>
            </div>
            {pincodeStatus && (
              <p className="checkout-pincode-status" role="status">{pincodeStatus}</p>
            )}

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