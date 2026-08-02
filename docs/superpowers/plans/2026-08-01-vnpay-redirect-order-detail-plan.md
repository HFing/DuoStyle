# VNPay Payment Outcome Redirect & Auto Open Order Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix blank page issue when VNPay payment redirects back with URL hash `#checkout` and query params, redirecting the user to Profile -> Orders Tab with `OrderDetailModal` auto-opened for the order.

**Architecture:** Update checkout routing resolution in `checkout.js`, manage URL state & hash cleanup in `App.jsx`, and auto-open `OrderDetailModal` in `ProfilePage.jsx`.

**Tech Stack:** React, JavaScript (ES6), Tailwind CSS, Axios.

## Global Constraints

- Preserve all existing routes, checkout flows, and COD payment handlers.
- Do not introduce breaking changes to `checkout.js` helper functions.
- Maintain clean URL after resolving payment outcome (remove query params & hash).

---

### Task 1: Update Checkout Navigation Resolution in `checkout.js`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/checkout.js:90-160`

**Interfaces:**
- Produces: `getPaymentOutcomeToast(outcome, orderCode)` -> `{ message: string, type: 'success' | 'error' }`
- Produces: Updated `resolveInitialNavigation(search, historyState)` -> `{ page: 'profile', profileTab: 'orders', autoOpenOrderCode: string, toastMessage: string, toastType: string }` when `page=payment-result` present.

- [ ] **Step 1: Implement `getPaymentOutcomeToast` and update `resolveInitialNavigation` in `checkout.js`**

Add `getPaymentOutcomeToast` and update `resolveInitialNavigation` in `checkout.js`:

```javascript
export function getPaymentOutcomeToast(outcome, orderCode) {
  const code = orderCode ? ` #${orderCode}` : '';
  if (outcome === 'success') {
    return { message: `Thanh toán VNPay đơn hàng${code} thành công!`, type: 'success' };
  }
  if (outcome === 'cancelled') {
    return { message: `Đã hủy thanh toán VNPay cho đơn hàng${code}.`, type: 'error' };
  }
  return { message: `Thanh toán VNPay cho đơn hàng${code} thất bại.`, type: 'error' };
}

export function resolveInitialNavigation(search, historyState) {
  const params = new URLSearchParams(search);
  if (params.get('page') === 'payment-result') {
    const outcome = params.get('outcome') || 'success';
    const orderCode = params.get('orderCode') || '';
    const toastInfo = getPaymentOutcomeToast(outcome, orderCode);

    return {
      page: 'profile',
      profileTab: 'orders',
      autoOpenOrderCode: orderCode,
      recoveryMessage: '',
      toastMessage: toastInfo.message,
      toastType: toastInfo.type,
    };
  }
  if (historyState?.page === 'checkout' && historyState.checkoutSource === 'BUY_NOW') {
    return { page: 'collections', recoveryMessage: BUY_NOW_RECOVERY_MESSAGE };
  }
  return { page: 'home', recoveryMessage: '' };
}
```

- [ ] **Step 2: Commit changes to `checkout.js`**

```bash
git add frontend/src/checkout.js
git commit -m "feat: resolve payment-result navigation to profile orders tab with auto open order code"
```

---

### Task 2: Handle URL Hash Cleanup, Toast, and Prop Passing in `App.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/App.jsx:30-70, 435-445`

**Interfaces:**
- Consumes: `resolveInitialNavigation` from `checkout.js`
- Produces: `autoOpenOrderCode` state passed to `ProfilePage`

- [ ] **Step 1: Update `getStoredNavState()` and `App.jsx` state initialization**

Update `getStoredNavState()` in `App.jsx` so if `initialNavigation.page === 'profile'` (or search query has `page=payment-result`), it bypasses stored hash/session values:

```javascript
const getStoredNavState = () => {
  if (initialNavigation.page === 'profile' && initialNavigation.autoOpenOrderCode) {
    return { page: 'profile', cat: '', prodId: null, searchKw: '', subCatId: null };
  }
  const hash = window.location.hash.replace('#', '').trim();
  const savedPage = sessionStorage.getItem('ds_page');
  const page = hash || savedPage || initialNavigation.page || 'home';
  const cat = sessionStorage.getItem('ds_cat_filter') || '';
  const prodId = sessionStorage.getItem('ds_prod_id') ? Number(sessionStorage.getItem('ds_prod_id')) : null;
  const searchKw = sessionStorage.getItem('ds_search_kw') || '';
  const subCatId = sessionStorage.getItem('ds_subcat_id') ? Number(sessionStorage.getItem('ds_subcat_id')) : null;

  return { page, cat, prodId, searchKw, subCatId };
};
```

In `App`:
```javascript
const [autoOpenOrderCode, setAutoOpenOrderCode] = useState(initialNavigation.autoOpenOrderCode || null);

useEffect(() => {
  if (initialNavigation.toastMessage) {
    showToast(initialNavigation.toastMessage, initialNavigation.toastType || 'success');
  }
  if (initialNavigation.autoOpenOrderCode || initialNavigation.recoveryMessage) {
    window.history.replaceState({}, '', window.location.pathname);
  }
  // ... rest of useEffect
```

Pass `autoOpenOrderCode={autoOpenOrderCode}` to `ProfilePage`:
```jsx
{currentPage === 'profile' && (
  <ProfilePage 
    user={user}
    initialTab={profileTabIntent}
    autoOpenOrderCode={autoOpenOrderCode}
    onNavigate={handleNavigate}
    onLogout={handleLogout}
    showToast={showToast}
    onUpdateUser={(updatedUser) => setUser(updatedUser)}
  />
)}
```

- [ ] **Step 2: Commit changes to `App.jsx`**

```bash
git add frontend/src/App.jsx
git commit -m "feat: clean up payment URL hash and pass autoOpenOrderCode to ProfilePage"
```

---

### Task 3: Auto-Open `OrderDetailModal` in `ProfilePage.jsx`

**Files:**
- Modify: `c:/Study/CayThue/DuoStyle/frontend/src/pages/ProfilePage.jsx:7-35, 59-100`

**Interfaces:**
- Consumes: `autoOpenOrderCode` prop in `ProfilePage`

- [ ] **Step 1: Add `autoOpenOrderCode` prop and auto-trigger modal logic in `ProfilePage.jsx`**

In `ProfilePage.jsx`:
```javascript
export default function ProfilePage({ user, initialTab, autoOpenOrderCode, onNavigate, onLogout, showToast, onUpdateUser }) {
```

In `useEffect` or handler in `ProfilePage.jsx`:
```javascript
useEffect(() => {
  if (autoOpenOrderCode) {
    setActiveTab('orders');
    setSelectedOrderCode(autoOpenOrderCode);
    setIsDetailModalOpen(true);
  }
}, [autoOpenOrderCode]);
```

- [ ] **Step 2: Commit changes to `ProfilePage.jsx`**

```bash
git add frontend/src/pages/ProfilePage.jsx
git commit -m "feat: auto open order detail modal when autoOpenOrderCode prop is provided"
```

---

### Task 4: Verification

- [ ] **Step 1: Test with URL `http://localhost:5173/?page=payment-result&outcome=success&orderCode=DS-91CACFD3#checkout`**
- [ ] **Step 2: Verify user lands on Profile -> Orders tab, sees toast notification, and `OrderDetailModal` opens with order details.**
