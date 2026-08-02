# Access Control & Admin Toast Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement route access controls for `/profile` and `/admin`, render a luxury 404 `NotFoundPage`, handle silent admin redirects, and replace all browser `alert()` calls in `AdminDashboardPage` with Toast notifications.

**Architecture:** Create `NotFoundPage.jsx`, add route guard logic inside `App.jsx` during navigation and initial auth load, and refactor alert calls in `AdminDashboardPage.jsx` to consume `showToast`.

**Tech Stack:** React, Javascript, Tailwind CSS.

## Global Constraints

- Do not show toast when Admin visits `/profile` (silent redirect).
- Show error toast when unauthenticated user visits `/profile`.
- Show 404 page when non-admin accesses `/admin`.
- Ensure `cmd /c npm run build` completes cleanly without errors.

---

### Task 1: Create `NotFoundPage.jsx` Component

**Files:**
- Create: `c:/Study/CayThue/DuoStyle/frontend/src/pages/NotFoundPage.jsx`

**Interfaces:**
- Produces: `NotFoundPage({ onNavigate })`

- [ ] **Step 1: Create `NotFoundPage.jsx`**

```jsx
import React from 'react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <main className="min-h-[70vh] pt-36 pb-section-gap px-margin-mobile md:px-margin-desktop flex items-center justify-center">
      <section className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 md:p-14 text-center shadow-sm">
        <span className="material-symbols-outlined text-8xl text-outline-variant mb-4 block">
          search_off
        </span>
        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold mb-2 block">
          404 ERROR
        </span>
        <h1 className="font-headline-md text-headline-md text-primary mb-4">
          Trang Không Tồn Tại
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-8">
          Trang bạn đang tìm kiếm không tồn tại, đã bị di chuyển hoặc bạn không có quyền truy cập.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-secondary transition-colors rounded cursor-pointer"
          >
            Quay Về Trang Chủ
          </button>
          <button
            type="button"
            onClick={() => onNavigate?.('collections')}
            className="border border-primary text-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-primary hover:text-on-primary transition-colors rounded cursor-pointer"
          >
            Xem Sản Phẩm
          </button>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit `NotFoundPage.jsx`**

```bash
git add frontend/src/pages/NotFoundPage.jsx
git commit -m "feat: create NotFoundPage component"
```

---

### Task 2: Implement Route Guards and Access Control in `App.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/App.jsx`

**Interfaces:**
- Consumes: `NotFoundPage` component
- Guard rules:
  - `profile` + `!user`: redirect `login`, `showToast("Vui lòng đăng nhập để xem trang cá nhân.", "error")`
  - `profile` + `checkIsAdmin(user)`: silent redirect `admin`
  - `admin` + `!checkIsAdmin(user)`: render `NotFoundPage`

- [ ] **Step 1: Update `App.jsx` to import `NotFoundPage` and apply route guards in `handleNavigate`, initial load, and page rendering**

Import `NotFoundPage` in `App.jsx`:
```javascript
import NotFoundPage from './pages/NotFoundPage';
```

In `handleNavigate` and `useEffect` auth check:
- Ensure if target is `profile`:
  - If `!user`: navigate `login` + `authMsg = 'Vui lòng đăng nhập để xem trang cá nhân.'` + toast.
  - If `user` & `checkIsAdmin(user)`: silent navigate `admin`.
- Ensure if target is `admin`:
  - If `!checkIsAdmin(user)`: set page to `not-found`.

In JSX render:
```jsx
{currentPage === 'not-found' && (
  <NotFoundPage onNavigate={handleNavigate} />
)}
```

- [ ] **Step 2: Commit changes to `App.jsx`**

```bash
git add frontend/src/App.jsx
git commit -m "feat: enforce access control guards and render NotFoundPage"
```

---

### Task 3: Replace `alert()` with `showToast()` in `AdminDashboardPage.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/AdminDashboardPage.jsx`

**Interfaces:**
- Consumes: `showToast(message, type)` prop passed from `App.jsx`.

- [ ] **Step 1: Replace all `alert(...)` calls in `AdminDashboardPage.jsx` with `showToast(...)`**

Replace:
- Success alerts with `showToast(msg, 'success')`
- Error/Warning alerts with `showToast(msg, 'error')`

- [ ] **Step 2: Commit `AdminDashboardPage.jsx`**

```bash
git add frontend/src/pages/AdminDashboardPage.jsx
git commit -m "refactor: replace browser alerts with showToast in AdminDashboardPage"
```

---

### Task 4: Verification & Build Test

- [ ] **Step 1: Execute `cmd /c npm run build` to verify frontend compilation**
