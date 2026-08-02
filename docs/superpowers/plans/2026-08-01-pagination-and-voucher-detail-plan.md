# Pagination, Search Filters & Voucher Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement pagination and search filtering across Admin lists (Orders, Inventory, Users), Collections catalog, Profile Orders, and display Voucher discount info in `OrderDetailModal`.

**Architecture:** Create reusable Pagination component, update `OrderDetailModal.jsx` to render voucher breakdown, update `AdminDashboardPage.jsx` with pagination & client/server filter states, update `CollectionsPage.jsx` and `ProfilePage.jsx` with pagination.

**Tech Stack:** React, Javascript, Tailwind CSS.

## Global Constraints

- Do not break existing API contracts or backend requests.
- Ensure all pagination controls look consistent with DuoStyle luxury design tokens.
- Ensure `cmd /c npm run build` completes cleanly.

---

### Task 1: Update `OrderDetailModal.jsx` for Voucher Discount Info

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/components/OrderDetailModal.jsx:160-175`

**Interfaces:**
- Consumes: `order.voucherCode`, `order.discountAmount`, `order.subtotalAmount`, `order.totalAmount`

- [ ] **Step 1: Update summary breakdown in `OrderDetailModal.jsx`**

```jsx
<div className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/40 space-y-3 mb-8">
  <div className="flex justify-between text-xs font-body-md text-on-surface-variant">
    <span>Tạm tính sản phẩm:</span>
    <span className="font-bold text-primary">{formatVND(order.subtotalAmount || order.totalAmount)}</span>
  </div>

  {order.voucherCode && (
    <div className="flex justify-between text-xs font-body-md text-emerald-700 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
      <span className="flex items-center gap-1 font-bold">
        <span className="material-symbols-outlined text-sm">confirmation_number</span>
        Mã giảm giá ({order.voucherCode}):
      </span>
      <span className="font-bold">-{formatVND(order.discountAmount || 0)}</span>
    </div>
  )}

  <div className="flex justify-between text-xs font-body-md text-on-surface-variant">
    <span>Phí vận chuyển:</span>
    <span className="font-bold text-emerald-600">Miễn phí</span>
  </div>
  <div className="flex justify-between text-sm font-headline-sm pt-3 border-t border-outline-variant/60 font-bold text-primary">
    <span>TỔNG THÀNH TIỀN:</span>
    <span className="text-secondary text-lg">{formatVND(order.totalAmount)}</span>
  </div>
</div>
```

- [ ] **Step 2: Commit `OrderDetailModal.jsx`**

```bash
git add frontend/src/components/OrderDetailModal.jsx
git commit -m "feat: display voucher code and discount amount in OrderDetailModal"
```

---

### Task 2: Create Reusable `Pagination` Component

**Files:**
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/components/Pagination.jsx`

**Interfaces:**
- Produces: `Pagination({ currentPage, totalPages, onPageChange, totalItems })`

- [ ] **Step 1: Create `Pagination.jsx`**

```jsx
import React from 'react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalItems = null }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-6 border-t border-outline-variant/40">
      {totalItems !== null && (
        <p className="font-label-caps text-xs text-on-surface-variant">
          Hiển thị trang <strong className="text-primary">{currentPage}</strong> / {totalPages} ({totalItems} kết quả)
        </p>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 border border-outline-variant rounded text-xs font-label-caps font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all cursor-pointer"
        >
          Trang Trước
        </button>

        {startPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded border border-outline-variant text-xs font-bold font-label-caps hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-xs text-on-surface-variant">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded text-xs font-bold font-label-caps transition-all cursor-pointer ${
              p === currentPage
                ? 'bg-primary text-white border border-primary shadow-xs'
                : 'border border-outline-variant hover:bg-primary hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-xs text-on-surface-variant">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded border border-outline-variant text-xs font-bold font-label-caps hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 border border-outline-variant rounded text-xs font-label-caps font-bold hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all cursor-pointer"
        >
          Trang Sau
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit `Pagination.jsx`**

```bash
git add frontend/src/components/Pagination.jsx
git commit -m "feat: create reusable Pagination component"
```

---

### Task 3: Implement Pagination & Search Filters in `AdminDashboardPage.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/AdminDashboardPage.jsx`

**Interfaces:**
- Consumes: `Pagination` component
- Adds pagination states for Admin Orders, Inventory Products, and Users.

- [ ] **Step 1: Import `Pagination` and add search + pagination controls to Admin Orders, Products, and Users lists**
- [ ] **Step 2: Commit `AdminDashboardPage.jsx`**

```bash
git add frontend/src/pages/AdminDashboardPage.jsx
git commit -m "feat: add pagination and search filtering to AdminDashboardPage"
```

---

### Task 4: Implement Pagination in `CollectionsPage.jsx` and `ProfilePage.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/CollectionsPage.jsx`
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/ProfilePage.jsx`

**Interfaces:**
- Consumes: `Pagination` component in `CollectionsPage` and `ProfilePage`

- [ ] **Step 1: Add Pagination to `CollectionsPage.jsx`**
- [ ] **Step 2: Add Pagination to Orders tab in `ProfilePage.jsx`**
- [ ] **Step 3: Commit `CollectionsPage.jsx` and `ProfilePage.jsx`**

```bash
git add frontend/src/pages/CollectionsPage.jsx frontend/src/pages/ProfilePage.jsx
git commit -m "feat: add pagination to CollectionsPage and ProfilePage orders list"
```

---

### Task 5: Build Verification

- [ ] **Step 1: Execute `cmd /c npm run build` to verify frontend compilation**
