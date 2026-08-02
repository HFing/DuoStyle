# VNPay Payment Outcome Redirect & Auto Open Order Detail Spec

## Goal
Fix the blank page bug occurring after VNPay payment callback (`?page=payment-result...#checkout`) and directly redirect the user to their Profile Page (Orders Tab) while automatically opening the Order Detail Modal (`OrderDetailModal`) for the created order.

## Requirements

### 1. Hash & URL Cleanup in Navigation (`checkout.js` & `App.jsx`)
- Parse `page=payment-result`, `outcome`, and `orderCode` from `window.location.search`.
- If `page=payment-result` is detected, clear `#checkout` from `window.location.hash` and clean up search parameters using `window.history.replaceState`.
- `resolveInitialNavigation` returns a target state pointing to `profile` page, `orders` tab, and passes `autoOpenOrderCode` along with a toast message.

### 2. Toast Notification Feedback
- Show toast based on `outcome`:
  - `success`: "Thanh toán VNPay đơn hàng #{orderCode} thành công!" (type: success)
  - `cancelled`: "Đã hủy thanh toán đơn hàng #{orderCode}." (type: error)
  - `failed`: "Thanh toán đơn hàng #{orderCode} thất bại." (type: error)

### 3. Order Detail Auto-Opening in Profile (`ProfilePage.jsx`)
- Pass `autoOpenOrderCode` to `ProfilePage`.
- In `ProfilePage.jsx`, when `autoOpenOrderCode` is present:
  - Set active tab to `orders`.
  - Set `selectedOrderCode` to `autoOpenOrderCode`.
  - Set `isDetailModalOpen(true)`.

## Verification Plan
- Test URL `http://localhost:5173/?page=payment-result&outcome=success&orderCode=DS-91CACFD3#checkout` directly in browser or simulate state.
- Verify user lands on Profile -> Orders tab with Toast notification and `OrderDetailModal` open for `DS-91CACFD3`.
