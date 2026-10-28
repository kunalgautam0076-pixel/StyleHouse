# StyleHouse API

## Razorpay checkout setup

The backend creates INR Razorpay orders from product prices stored in MongoDB,
verifies the payment signature, and captures authorized payments before marking
an order paid.

1. Create API keys in the Razorpay Dashboard. Use **Test Mode** keys while
   developing.
2. Add these values to `backend/.env` (never commit the secret):

   ```env
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   ```

3. Restart the backend. The API returns a configuration error until both keys
   are present.
4. Complete a test checkout using a Razorpay-supported test payment method.
   Switch to live keys only after configuring and testing the Razorpay account.

Product prices are treated as Indian rupees (INR). Checkout shipping is INR 15
for orders up to INR 200 and free for orders above INR 200.
