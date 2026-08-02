# Admin Voucher Management & Top 5 Best Selling Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Admin Voucher Management CRUD tab and Top 5 Best-Selling Products Analytics widget end-to-end from Spring Boot to React frontend.

**Architecture:** 
- Add `CreateVoucherRequest.java`, `TopProductResponse.java` DTOs.
- Extend `VoucherService` and `AdminVoucherController` for full Admin voucher CRUD operations.
- Extend `OrderService` and `AdminOrderController` for Top 5 Best Sellers analytics query.
- Add `vouchers` tab and Top 5 Best Sellers card in `AdminDashboardPage.tsx`.

**Tech Stack:** Java 25, Spring Boot 4.1.0, JPA/Hibernate, MySQL, React, TypeScript, TailwindCSS.

---

### Task 1: Backend DTOs & Admin Voucher Management API

**Files:**
- Create: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\dto\request\CreateVoucherRequest.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\VoucherService.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\impl\VoucherServiceImpl.java`
- Create: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\controller\AdminVoucherController.java`

- [ ] **Step 1: Create `CreateVoucherRequest.java`**
- [ ] **Step 2: Add voucher admin methods to `VoucherService.java` and implement in `VoucherServiceImpl.java`**
- [ ] **Step 3: Create `AdminVoucherController.java` with GET, POST, PUT toggle, DELETE endpoints**

---

### Task 2: Backend Top 5 Best-Selling Products Analytics API

**Files:**
- Create: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\dto\response\TopProductResponse.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\OrderService.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\service\impl\OrderServiceImpl.java`
- Modify: `c:\Study\CayThue\DuoStyle\backend\src\main\java\com\DuoStyle\DuoStyle\controller\AdminOrderController.java`

- [ ] **Step 1: Create `TopProductResponse.java`**
- [ ] **Step 2: Add `getTopSellingProducts(int limit)` to `OrderService.java` and implement in `OrderServiceImpl.java`**
- [ ] **Step 3: Add `@GetMapping("/analytics/top-products")` to `AdminOrderController.java`**
- [ ] **Step 4: Recompile and restart Spring Boot backend**

---

### Task 3: Frontend Voucher Management & Top 5 Products Widget in AdminDashboardPage.tsx

**Files:**
- Modify: `c:\Study\CayThue\DuoStyle\frontend\src\pages\AdminDashboardPage.tsx`

- [ ] **Step 1: Add `topProducts` and `vouchersList` states & fetch hooks**
- [ ] **Step 2: Render Top 5 Best Sellers table widget in Analytics tab**
- [ ] **Step 3: Render Voucher Management tab in Sidebar with Create Modal and Action Handlers**
- [ ] **Step 4: Verify frontend build and full functionality**
