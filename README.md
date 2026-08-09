# BootCamp Registration

This repository contains a React frontend and an Express/MongoDB backend for a bootcamp registration flow with Paystack payment integration.

## Structure
- `bootcampfrontend/` — React application, registration modal, Paystack checkout flow.
- `bootcampbackend/` — Express API, MongoDB registration schema, Paystack initialization and verification endpoints.

## Run locally
### Backend
1. Copy `bootcampbackend/.env.example` to `bootcampbackend/.env`.
2. Fill in `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, and `PAYSTACK_CALLBACK_URL`.
3. Install dependencies:
   - `cd bootcampbackend`
   - `npm install`
4. Start the server:
   - `npm run dev`

### Frontend
1. Install dependencies:
   - `cd bootcampfrontend`
   - `npm install`
2. Create `.env` in `bootcampfrontend/` with:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```
3. Start the app:
   - `npm start`

## Payment flow
1. User submits registration details in the frontend.
2. Frontend sends the data to `POST /api/payment/initialize`.
3. Backend creates a Paystack transaction and returns `publicKey` and `reference`.
4. Frontend opens Paystack inline checkout.
5. When Paystack reports success, frontend calls `POST /api/payment/verify`.
6. Backend verifies the transaction and saves the registration only after successful payment.

## Notes
- No registration is stored in MongoDB until Paystack payment is confirmed.
- The confirmation email is sent after the registration record is created.
- The frontend loads the Paystack script dynamically and never stores secret keys.
