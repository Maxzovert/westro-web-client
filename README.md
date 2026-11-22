# Wastro Website Client

## Phase 06 — Payments

- After place-order, checkout starts payment and redirects to `/checkout/pay/[paymentId]`
- Mock provider page can succeed/fail (server-side capture)
- `/checkout/complete` only reads order/payment status from the API
- Pending orders expose **Pay now** on `/account/orders/[id]`
