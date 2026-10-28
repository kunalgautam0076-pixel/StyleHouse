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

## Production deployment

The repository includes a Render Blueprint in `../render.yaml` for the API.
Create the web service from that Blueprint and enter the requested values in
the Render dashboard:

- `MONGO_URI`: the production MongoDB connection string.
- `CLIENT_URL`: the exact HTTPS URL of the deployed Vercel frontend.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: keep Test Mode keys until the
  deployed checkout has been verified; use Live Mode only when ready to accept
  real payments.

Render generates `JWT_SECRET` and supplies `PORT`. For the Vercel frontend,
select `frontend` as the project root and set `VITE_API_BASE_URL` to
`https://<your-render-service>.onrender.com/api/v1`. Redeploy the frontend
after setting the variable. Then set `CLIENT_URL` on Render to the final
frontend URL and redeploy the API.

Keep all production credentials in the hosting providers' environment-variable
settings. Never commit `.env` files or real payment secrets.
