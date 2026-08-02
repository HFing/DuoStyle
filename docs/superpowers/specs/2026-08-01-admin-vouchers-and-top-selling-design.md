# Spec Design: Admin Voucher Management & Top 5 Best Selling Products Analytics

## 1. Overview
This design covers two key features:
1. **Admin Voucher Management**: Complete CRUD for discount vouchers in Admin Dashboard (view all, create new voucher, toggle active status, delete voucher).
2. **Top 5 Best Selling Products Widget**: Analytics endpoint and UI component displaying top 5 products by quantity sold & total revenue on the Admin Analytics tab.

---

## 2. Admin Voucher Management Architecture

### Backend:
1. **Request DTO**: `CreateVoucherRequest.java` in `com.DuoStyle.DuoStyle.dto.request`
   - `String code`
   - `String title`
   - `String description`
   - `String discountType` ("PERCENT" | "FIXED")
   - `BigDecimal discountValue`
   - `BigDecimal minOrderAmount`
   - `BigDecimal maxDiscountAmount`
   - `String expiryDate` (ISO String or LocalDateTime)

2. **VoucherService & Implementation**:
   - `List<VoucherResponse> getAllVouchersForAdmin()`
   - `VoucherResponse createVoucher(CreateVoucherRequest request)`
   - `VoucherResponse toggleVoucherStatus(Long id)`
   - `void deleteVoucher(Long id)`

3. **Controller**: `AdminVoucherController.java` (`/api/v1/admin/vouchers`)
   - `GET /api/v1/admin/vouchers`
   - `POST /api/v1/admin/vouchers`
   - `PUT /api/v1/admin/vouchers/{id}/toggle`
   - `DELETE /api/v1/admin/vouchers/{id}`

### Frontend (`AdminDashboardPage.tsx`):
1. **New Sidebar Tab**: `vouchers` ("Mã Giảm Giá")
2. **Table View**: Display code, title, discount value, min order, status badge (ACTIVE / INACTIVE), action buttons (Toggle Status, Delete).
3. **Create Voucher Modal**: Full form for adding vouchers.

---

## 3. Top 5 Best Selling Products Analytics Architecture

### Backend:
1. **Response DTO**: `TopProductResponse.java` in `com.DuoStyle.DuoStyle.dto.response`
   - `Long productId`
   - `String productName`
   - `String thumbnailUrl`
   - `String categoryName`
   - `long totalQuantitySold`
   - `BigDecimal totalRevenue`

2. **OrderService & Implementation**:
   - `List<TopProductResponse> getTopSellingProducts(int limit)`
   - Aggregate sales per product from non-cancelled orders.

3. **Controller Endpoint**: `GET /api/v1/admin/orders/analytics/top-products?limit=5` in `AdminOrderController.java`.

### Frontend (`AdminDashboardPage.tsx`):
1. Fetch `/api/v1/admin/orders/analytics/top-products` on load.
2. Display a Top 5 Best Sellers table widget inside the Analytics tab below the Sales Overview chart.
