# Access Control & Admin Toast Notification Spec

## Goal
Implement access control for `/profile` and `/admin` routes, show 404 Not Found page for unauthorized access to `/admin`, handle silent redirect for Admin accessing `/profile`, and replace browser `alert()` calls in `AdminDashboardPage.jsx` with `showToast()`.

## Requirements

### 1. Access Control Logic (`App.jsx`)
- **Unauthenticated Access to `/profile`**:
  - Redirect to `login` page.
  - Show toast / auth message: `"Vui lòng đăng nhập để truy cập trang cá nhân."` (type: error).
- **Admin Access to `/profile`**:
  - Silently redirect to `admin` page (`currentPage = 'admin'`).
  - No unnecessary notification message shown.
- **Unauthorized Access to `/admin` (`!user` or regular non-admin user)**:
  - Set `currentPage` to `'not-found'`.
  - Render `NotFoundPage.jsx`.

### 2. 404 Not Found Page Component (`frontend/src/pages/NotFoundPage.jsx`)
- Create standard, luxury-themed `NotFoundPage.jsx` component.
- Display "404 - Page Not Found", helpful message, and quick action buttons ("Quay Về Trang Chủ", "Xem Bộ Sưu Tập").

### 3. Replace Browser `alert()` in `AdminDashboardPage.jsx`
- Replace all `alert(...)` calls (16 locations) in `AdminDashboardPage.jsx` with `showToast(msg, 'success' | 'error')`.

## Verification Plan
- Build frontend using `cmd /c npm run build`.
- Verify non-logged-in user attempting to go to profile gets redirected to login with toast message.
- Verify admin user attempting to go to profile is silently sent to Admin Dashboard.
- Verify non-admin user attempting to access `/admin` sees 404 Not Found page.
- Verify Admin operations trigger Toast notifications instead of browser alert dialogs.
