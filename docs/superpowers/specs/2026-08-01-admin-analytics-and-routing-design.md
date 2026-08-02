# Spec Design: Admin Routing Fix & Dynamic Monthly Sales Overview Analytics

## 1. Overview
This design covers:
1. Fixing the Admin Login / Page Refresh 404 (Not Found) routing bug when accessing `/admin` or logging in as Admin.
2. Building an end-to-end dynamic **Sales Overview - Monthly growth trend (VNĐ)** chart connecting Spring Boot MySQL analytics backend to React frontend SVG chart.

---

## 2. Admin Routing & Guard Resolution Fix

### Problem:
In `App.tsx`, when `currentPage === 'admin'` during initial session loading or login redirect, `api.get('/auth/me')` is executed asynchronously. Before the user state resolves from `null` to the authenticated admin user, the access guard evaluates `!resolvedUser || !isUserAdmin` as `true` and sets `currentPage` to `'not-found'`.

### Solution:
- Update access control guard in `App.tsx`:
  - When `currentPage === 'admin'`:
    - If `user` is not logged in: navigate to `'login'` with prompt message ("Vui lòng đăng nhập tài khoản Admin.").
    - If `user` is logged in but not admin: navigate to `'home'` with error message ("Bạn không có quyền truy cập trang Quản Trị.").
    - If `user` is admin (`checkIsAdmin(user)`): maintain `currentPage = 'admin'`.

---

## 3. Dynamic Sales Overview Monthly Growth Trend Analytics

### Backend Components:
1. **DTO**: `MonthlySalesResponse.java` in `com.DuoStyle.DuoStyle.dto.response`
   - `int month` (1 - 12)
   - `String monthName` ("JAN", "FEB", ..., "DEC")
   - `BigDecimal revenue`
   - `long orderCount`

2. **OrderService & Implementation**:
   - `List<MonthlySalesResponse> getMonthlySalesAnalytics(Integer year)`
   - Aggregate non-cancelled orders from database by month for the requested year (default to current year 2026).

3. **Controller Endpoint**:
   - Endpoint: `GET /api/v1/admin/orders/analytics/monthly?year=2026` in `AdminOrderController.java`.
   - Returns `ApiResponse<List<MonthlySalesResponse>>`.

### Frontend Components (`AdminDashboardPage.tsx`):
1. **Analytics State**:
   - `monthlySales`: Array of 12 monthly revenue items fetched from backend.
   - `hoveredMonth`: Index of hovered data point for tooltip preview.

2. **SVG Dynamic Chart**:
   - Calculate coordinate Y based on max monthly revenue.
   - Render dynamic SVG `<path>` and `<polyline>` points for 12 months.
   - Render interactive `<circle>` dots with tooltip displaying exact formatted VNĐ revenue & total order count.
   - Support `Monthly` vs `Quarterly` aggregation views.
