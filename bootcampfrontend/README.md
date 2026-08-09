# Payment integration — what's included and what you still need

## Files
- `src/utils/paystack.js` — loads the Paystack inline script and opens the checkout popup.
- `src/utils/api.js` — talks to your existing backend (`https://bootcamp-yq8i.onrender.com/api`).
- `src/components/RegistrationModal.jsx` — the form (same fields/validation as before) plus the
  register → initialize payment → open Paystack → verify → success flow.
- `src/components/SuccessScreen.jsx` — shown once payment is verified.
- `src/components/KingsCodeHero.jsx` — full page: Hero, Who it's for, Mission, Courses, final CTA.

## Frontend flow
1. User fills the form → client-side validation (unchanged from your original code).
2. `POST /api/register` — creates the student record. Must return `{ success, studentId }`.
3. `POST /api/payment/initialize` — must return `{ success, reference, publicKey }`.
   `reference` is the transaction reference your backend generated when it called
   Paystack's `/transaction/initialize`. `publicKey` is your Paystack **public** key
   (safe to expose — never send the secret key to the frontend).
4. Paystack inline popup opens with that reference and amount (₦1,000 / 100000 kobo).
5. On successful charge, the frontend calls `POST /api/payment/verify` with `{ reference }`.
   Your backend should re-check the transaction against Paystack's
   `/transaction/verify/:reference` endpoint (never trust the client-side callback alone)
   and return `{ success, verified }`.
6. Only once `verified: true` comes back does the UI show the success screen.

## What you still need on the backend (Node/Express + Paystack secret key)
```
POST /api/payment/initialize
  body: { email, studentId, amount }        // amount in kobo
  -> calls Paystack POST https://api.paystack.co/transaction/initialize
     with your PAYSTACK_SECRET_KEY
  -> returns { success: true, reference, publicKey: PAYSTACK_PUBLIC_KEY }

POST /api/payment/verify
  body: { reference }
  -> calls Paystack GET https://api.paystack.co/transaction/verify/:reference
  -> confirms status === 'success' and amount matches 100000
  -> marks the student's seat as paid in your database
  -> returns { success: true, verified: true }
```

It's also worth adding a Paystack **webhook** endpoint
(`POST /api/payment/webhook`) as a backup confirmation path, in case the user
closes the tab right after paying and the verify call never fires from the browser.

## Env / config
- No Paystack keys live in the frontend except the public key, and even that comes
  from your backend response rather than being hardcoded — so you can rotate it
  without a redeploy.
- Amount is defined once in `src/utils/paystack.js` (`REGISTRATION_FEE_NGN = 1000`).

## Not yet wired up
- "Seats remaining" — `RegistrationModal` accepts a `seatsRemaining` prop and will
  display it if you pass a number in from a real endpoint; it's left out by default
  rather than showing a made-up count.