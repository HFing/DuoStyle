# Pagination, Search Filters & Voucher Details Design Spec

## Goal
Implement full pagination and search filters across Admin Dashboard lists (Orders, Inventory/Products, Users), Collections catalog page, and User Profile Order history, as well as updating `OrderDetailModal` to display applied Voucher code and discount breakdown.

## Requirements

### 1. Order Detail Modal Update (`OrderDetailModal.jsx`)
- Show Subtotal (`subtotalAmount`), Voucher code (`voucherCode`), Discount Amount (`discountAmount`), and Final Total (`totalAmount`).
- Display discount row in styled emerald badge/text: `Mã giảm giá (DISCOUNT10): -100.000 ₫`.

### 2. Admin Dashboard Pagination & Filtering (`AdminDashboardPage.jsx`)
- **Admin Orders**:
  - Search bar (Filter by Order Code `#DS-...` or Customer Phone / Address / Name).
  - Status filter tabs (`ALL`, `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - Pagination UI (10 items per page with Prev, Next, page buttons, total records indicator).
- **Admin Inventory / Products**:
  - Search bar (by Product Name / SKU) + Stock status filter.
  - Pagination UI (10 items per page).
- **Admin Users**:
  - Search bar (by Name / Email / Phone).
  - Pagination UI (10 items per page).

### 3. Catalog Collections Search, Filters & Pagination (`CollectionsPage.jsx`)
- In-page Search Keyword input bar.
- Interactive Category, Gender, Size, and Max Price filters.
- Pagination UI (12 items per page) with smooth scroll to top on page switch.

### 4. User Profile Order History Pagination (`ProfilePage.jsx`)
- Paginate orders list (5 orders per page) with page navigation controls.

## Verification Plan
- Verify `cmd /c npm run build` compiles cleanly.
- Test modal order detail view with voucher applied.
- Test pagination controls in Admin orders, products, users, Collections page, and Profile page.
