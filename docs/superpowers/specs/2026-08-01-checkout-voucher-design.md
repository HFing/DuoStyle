# DuoStyle Checkout Voucher Design

**Date:** 2026-08-01

## Goal

Allow customers to enter and apply one voucher during CART or BUY_NOW checkout while keeping Spring Boot authoritative for eligibility, discount, order totals, and VNPay amount.

## Scope

- One voucher code per order.
- Existing `PERCENT` and `FIXED` voucher types remain supported.
- No usage quota, per-user usage history, reservation, stacking, or campaign engine.
- Existing COD and VNPay checkout flows remain unchanged except for their final discounted amount.

## Data Contract

`CreateOrderRequest` gains an optional `voucherCode`. The browser never sends a trusted discount or final total.

`Order` stores immutable checkout snapshots:

- `subtotalAmount`: sum of database variant prices multiplied by quantities.
- `voucherCode`: normalized applied code, or null.
- `discountAmount`: calculated discount, zero when no voucher.
- `totalAmount`: `max(subtotalAmount - discountAmount, 0)`.

`OrderResponse` exposes all four values so Checkout confirmation and order history can show the same calculation that was charged.

## Backend Flow

1. Load every requested product variant and calculate `subtotalAmount` from current database prices.
2. When `voucherCode` is non-blank, normalize it with trim and uppercase.
3. Load an active voucher by code.
4. Reject missing, inactive, or expired vouchers.
5. Reject an order below `minOrderAmount`.
6. For `PERCENT`, calculate `subtotalAmount * discountValue` and cap with `maxDiscountAmount` when configured.
7. For `FIXED`, use `discountValue`.
8. Clamp discount to the subtotal so total never becomes negative.
9. Persist the pricing snapshot on Order and use `totalAmount` for Payment and VNPay signing.

The existing `/vouchers/apply` endpoint becomes a preview endpoint only. It may show the expected discount in Checkout, but order creation repeats the calculation against database-derived subtotal. Expiry validation is added consistently to both preview and order creation. Active voucher listings exclude expired vouchers.

## Frontend Flow

Checkout shows:

- Voucher code input.
- Apply button and loading state.
- Applied voucher confirmation or Vietnamese validation error.
- Subtotal, discount, and final payable total.
- A remove/change voucher action.

Applying calls `/vouchers/apply` with the displayed item subtotal for preview. Creating the order sends only the normalized code in `voucherCode`; the backend response is authoritative. If backend revalidation rejects the code, Checkout preserves delivery details, payment method, items, and entered voucher.

The flow works identically for CART and BUY_NOW.

## Error Handling

- Blank code is treated as no voucher when creating an order; the Apply button rejects blank input locally.
- Missing/inactive/expired code returns a concise Vietnamese business error.
- Unsupported discount type or invalid negative discount configuration is rejected rather than silently charging a surprising amount.
- Preview failures never clear checkout items or delivery details.

## Testing

Backend tests cover no voucher, percent, maximum cap, fixed discount, minimum order, expired/inactive/missing vouchers, discount clamping, database-derived subtotal, persisted snapshot, and discounted COD/VNPay Payment amount.

Frontend pure tests cover normalized code in payload, preview summary calculation, applying/removing a voucher, and preservation after API failure. Frontend test/lint/build and backend focused/full tests are run before completion.

## Acceptance Criteria

1. Customer can apply or remove one voucher on CART and BUY_NOW Checkout.
2. Checkout visibly shows subtotal, discount, and final total.
3. Browser cannot choose the final discount or amount.
4. Stored order and payment contain the same discounted total.
5. VNPay signs the discounted total.
6. Expired, inactive, missing, and minimum-order failures are shown without losing Checkout state.
