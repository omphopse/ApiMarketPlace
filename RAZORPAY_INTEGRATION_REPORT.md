# Razorpay Integration Report

## Summary
This change implements a test-mode Razorpay payment flow for paid subscription plans and preserves the existing free-plan activation behavior. Key frontend and backend updates were made to ensure paid subscriptions require a verified Razorpay payment before activation and API-key generation.

## Status
- Razorpay Checkout: PENDING (requires manual browser test)
- Payment Order (backend): IMPLEMENTED
- Payment Verification (backend): IMPLEMENTED
- Subscription Activation (post-verification): IMPLEMENTED
- API Key Generation (post-activation): PRESERVED / INVOKED AFTER ACTIVATION
- API-key protected API call: PENDING (manual test)
- Rate Limiting: UNCHANGED
- Usage Tracking: UNCHANGED

## Backend changes
- Added `razorpay` config binding usage. Test properties added in `src/test/resources/application-test.properties`.
- `PaymentController` already existed and is used for:
  - `POST /api/consumer/payments/create-order` — create Razorpay order
  - `POST /api/consumer/payments/verify` — verify signature & activate subscription
- `PaymentServiceImpl` creates Razorpay orders and verifies signatures using Razorpay SDK and `RazorpayConfig` (test keys should be supplied via properties or environment variables `razorpay.key-id` and `razorpay.key-secret`).
- `ConsumerService.activateSubscriptionDev` introduced to restrict dev endpoint activation to free plans in non-test profiles; test profile still allows activation for test convenience.
  - Updated `ConsumerController` dev activation endpoint to call the new dev activation method.

Files changed:
- `src/test/resources/application-test.properties` — added `razorpay.key-id` and `razorpay.key-secret` placeholders
- `src/main/java/com/marketplace/service/ConsumerService.java` — added `activateSubscriptionDev` signature
- `src/main/java/com/marketplace/service/impl/ConsumerServiceImpl.java` — implemented `activateSubscriptionDev`, injected `Environment`
- `src/main/java/com/marketplace/controller/ConsumerController.java` — route dev activation to `activateSubscriptionDev`

## Frontend changes
- `frontend/src/services/consumerService.js` — added `createPaymentOrder(subscriptionId)` and `verifyPayment(payload)` API calls.
- `frontend/src/pages/CheckoutPage.jsx` — updated to:
  - For free plans (price <= 0): continue to call dev activation (existing behavior).
  - For paid plans: create subscription, call backend to create a Razorpay order, load Razorpay checkout script, open Razorpay modal, handle success/failure/cancel, send verification to backend, and only on successful verification show activated subscription/API key and navigate to success page.

## Database changes
- No schema or collection migrations were made. `Payment` entity is used (existing). The payment record stores Razorpay order id and is updated on verification.

## How it works (high-level)
1. Frontend requests subscription creation via `/api/consumer/subscriptions`.
2. For paid plans, frontend calls `/api/consumer/payments/create-order` with `subscriptionId`.
3. Backend creates a Razorpay order via SDK, stores a `Payment` record with status CREATED and returns the order id and `keyId`.
4. Frontend loads `https://checkout.razorpay.com/v1/checkout.js` if not already available, initializes `window.Razorpay` with returned order details, and opens the modal.
5. On client-side payment success, frontend sends `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature` to `/api/consumer/payments/verify`.
6. Backend verifies signature with the secret key, marks payment SUCCESS, activates the subscription, and generates the API key. The backend returns the activation response including the API key.

## Manual Test Steps
1. Start backend: `./mvnw.cmd spring-boot:run` (ensure `razorpay.key-id` and `razorpay.key-secret` are set in `application.properties` or environment for non-test runs).
2. Start frontend: follow `frontend/FRONTEND_RUN_GUIDE.md` (default `http://localhost:5173`).
3. Login as a consumer.
4. Select a paid plan and open Checkout. Ensure the button starts the flow: "Creating Razorpay order...", then "Opening Razorpay...".
5. Confirm `https://checkout.razorpay.com/v1/checkout.js` loads and `window.Razorpay` exists.
6. When the Razorpay modal opens, use Razorpay TEST cards to complete the payment.
7. Verify backend log shows signature verification and subscription activation, and frontend shows the API key.
8. Test cancellation by closing the modal — subscription should remain pending and no API key should be shown.

## Notes and Next Steps
- Tests: existing integration tests that used the dev activation endpoint for paid plans may need updating now that dev activation is restricted to free plans unless running the `test` profile (current implementation allows test profile activation).
- Security: Do not expose `razorpay.key-secret` to the client. Only `razorpay.key-id` (public) travels to the client via backend responses.
- If Razorpay checkout modal does not open, check browser console for blocked script, CSP, or mixed content issues. See the frontend `CheckoutPage.jsx` which provides better error messages.

## Verdict
- Implementation: COMPLETE (backend + frontend changes added)
- Razorpay Checkout test: PENDING — requires manual browser verification to mark as PASS.


