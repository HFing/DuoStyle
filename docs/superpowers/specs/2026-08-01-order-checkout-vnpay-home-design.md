# DuoStyle Order Checkout, VNPay, and Database Home Design

**Date:** 2026-08-01

## Goal

Build one simple local checkout flow that supports a multi-item cart and buy-now purchases, requires and saves delivery details, accepts COD or VNPay Sandbox payment, reports cancelled VNPay payments, and renders Home products from the database.

## Scope

- Customer checkout only; existing admin order management remains unchanged.
- No idempotency keys, webhook/IPN processing, retry framework, reservation expiry, or production payment hardening.
- VNPay uses the hosted Sandbox payment page and returns the browser to the local React application.
- Product prices and order totals are calculated by the backend from current database variants.

## Architecture

The React application gets a dedicated checkout page and a payment-result page. Cart checkout and buy-now both create the same `CreateOrderRequest`; buy-now keeps its item selection in application navigation state and does not mutate the cart. Spring Boot owns validation, pricing, order persistence, profile delivery-detail updates, and VNPay result handling.

The backend records a payment row for each order. COD orders are immediately ready for processing. VNPay orders remain pending until VNPay returns a signed result. The return endpoint updates the order and payment, then redirects the browser to the frontend result page with only the order code and outcome needed for display.

## Checkout Sources

### Cart checkout

- Uses every current cart item in one order.
- Quantities and variant IDs come from the cart response displayed to the customer.
- The backend reloads every variant and calculates all prices.
- The cart is cleared after a successful COD order or successful VNPay return.
- A cancelled or failed VNPay payment leaves the cart intact.

### Buy now

- Product Detail requires a selected variant and positive quantity.
- Clicking Buy Now navigates directly to Checkout with that one variant and quantity.
- The existing cart is neither read nor modified for this order.

Refreshing a buy-now checkout without its navigation state returns the customer to the product/catalog flow with an explanatory message; no temporary cart record is created.

## Delivery Details

Checkout loads the authenticated user's `phone` and `address` and pre-fills the form. Both fields are editable on Checkout. The order request must contain non-blank values; the backend trims and validates them and saves the accepted values both as the order's delivery snapshot and as the user's new default profile details.

The order retains its own phone and address so later profile changes do not alter historical orders.

## Order and Payment States

- COD: create `Payment(status=PENDING, paymentMethod=COD)` and `Order(status=PROCESSING)`; show the local success result immediately.
- VNPay before return: create `Payment(status=PENDING, paymentMethod=VNPAY)` and `Order(status=PENDING)`; return the hosted payment URL to React.
- VNPay response code `00` with a valid signature: set payment to `SUCCESS`, save the transaction number/payment time, set order to `PROCESSING`, clear the source cart when applicable, then redirect to the frontend success result.
- Any other valid VNPay response code, including customer cancellation: set payment to `CANCELLED`, set order to `CANCELLED`, keep the cart, then redirect to the frontend cancelled result.
- An invalid signature does not mark payment successful; it marks the local outcome invalid/failed and redirects to a failure result.

The frontend result page displays Vietnamese copy for success, cancellation, or failure and offers links back to order history and Home.

## VNPay Integration

- Use the configured Sandbox pay URL, terminal code, hash secret, and return URL.
- The signed transaction reference identifies the local order.
- Include amount, locale, creation/expiry times, client IP, and the standard VNPay secure hash.
- The backend validates the returned secure hash and verifies the returned amount matches the stored order total before accepting success.
- The backend return URL responds with an HTTP redirect to `http://localhost:5173` using the application's payment-result navigation convention.
- Real Sandbox credentials remain environment configuration and are not committed into source files.

## API Changes

- `POST /api/v1/orders` remains the unified create-order endpoint and returns the order plus `paymentUrl` for VNPay.
- The create request includes delivery details, payment method, line items, and a checkout source (`CART` or `BUY_NOW`).
- `GET /api/v1/payments/vnpay-return` accepts VNPay query parameters, validates and applies the result, and redirects to the frontend.
- Order history queries are restricted to the authenticated user's own orders.
- The public endpoint that accepts arbitrary `orderId` and `amount` for VNPay URL generation is removed or made inaccessible; payment URLs are generated only from a persisted owned order.

## Frontend Flow

- Add `checkout` and `payment-result` page states to the existing application navigation model.
- Cart's checkout button opens Checkout with the current cart items and source `CART`.
- Product Detail exposes Buy Now beside Add to Cart and opens Checkout with source `BUY_NOW`.
- Checkout shows item summaries, database-derived prices already returned by the API, total, delivery form, and COD/VNPay choice.
- On COD success, navigate to the success result and refresh global cart state.
- On VNPay selection, assign `window.location.href` to the returned hosted URL.
- On payment return, parse the result query parameters and show success/cancelled/failure without calling a second mutation endpoint.

## Home Database Data

- Home requests published/current products through the existing product API for its sections.
- Remove hard-coded product fallback behavior from Home.
- Derive New Arrivals from the database response sorted by creation time.
- Gender sections request database-filtered MEN and WOMEN products.
- Show loading placeholders, an empty state when the database has no matching products, and a visible retry/error message on request failure.

## Validation and Errors

- Authentication is required for cart, checkout, order creation, order history, and owned order details.
- Reject empty items, non-positive quantities, missing variants, missing phone/address, unsupported payment methods, and insufficient stock.
- Reject access to another user's order.
- Failure to send confirmation email must not prevent a locally valid order from being returned; email is outside the critical checkout transaction.
- API failures remain on Checkout and show a concise Vietnamese error without clearing selections.

## Inventory

At order creation, validate that each requested quantity is available. Decrease stock once the order becomes payable/processable: immediately for COD and on successful VNPay return. Cancelled or failed VNPay orders do not decrease stock. This simple local model does not reserve stock while the user is on VNPay.

## Testing

- Backend service tests cover multi-item total calculation, profile delivery-detail persistence, validation, cart-versus-buy-now behavior, COD state, VNPay pending state, valid success return, cancellation return, invalid signature, amount mismatch, ownership, stock changes, and cart clearing.
- Controller tests cover authentication, request validation, VNPay redirect targets, and public return access.
- Frontend tests, where supported by the current toolchain, cover checkout payload construction and result-state parsing; otherwise these pure transformations will be extracted and verified through the available lint/build checks plus browser smoke testing.
- End-to-end local verification covers cart COD, buy-now COD, cart VNPay success, VNPay cancellation, profile defaults, order history, and Home data loaded from MySQL.

## Acceptance Criteria

1. An authenticated user can edit phone/address on Checkout and those values become profile defaults.
2. One order can contain all items currently shown in the user's cart.
3. Buy Now creates a one-item checkout without changing the cart.
4. COD produces a visible successful local order.
5. VNPay opens its hosted Sandbox page and returns to DuoStyle with a success, cancellation, or failure message matching the verified result.
6. Cart contents are cleared only for successful cart-source checkout.
7. Order history shows only the current user's orders and includes the resulting status.
8. Home product sections render database products and never substitute hard-coded sample products.
