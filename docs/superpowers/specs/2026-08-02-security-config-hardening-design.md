# Design Specification: Security Architecture Hardening & Endpoint Protection

**Date:** 2026-08-02  
**Target Subsystem:** Backend Spring Security (`com.DuoStyle.DuoStyle.config.SecurityConfig`)

---

## 1. Overview & Objective
Currently, `SecurityConfig.java` utilizes `.anyRequest().permitAll()`, exposing unlisted endpoints (such as image upload and administrative APIs missing strict matchers) to unauthenticated public access by default. Additionally, `@PreAuthorize` annotations in controllers (e.g. `BannerController`, `ReviewController`) are currently inactive due to the absence of `@EnableMethodSecurity`.

This update hardens backend authorization by enforcing a default-deny policy (`.anyRequest().authenticated()`), explicitly defining public access rules for guest storefront browsing and AI assistance, and enabling method-level security annotations across the application.

---

## 2. Architectural & Configuration Changes

### A. Method-Level Security
- Add `@EnableMethodSecurity` to `SecurityConfig.java`.
- Ensures `@PreAuthorize("hasRole('ADMIN')")` and `@PreAuthorize("isAuthenticated()")` annotations declared in controllers are enforced independently at invocation time.

### B. Request Authorization Rules (`SecurityFilterChain`)
- **Default Policy:** `.anyRequest().authenticated()` (Any unlisted endpoint requires authentication).
- **Public Endpoints (`.permitAll()`):**
  - Auth Login & Register: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`
  - OAuth2 Authentication Flow: `/oauth2/**`, `/login/oauth2/**`
  - Storefront Catalog Read (GET):
    - `GET /api/v1/products/**`
    - `GET /api/v1/categories/**`
    - `GET /api/v1/banners`
    - `GET /api/v1/vouchers`
    - `GET /api/v1/products/*/reviews`
  - Payment Gateway Return Callback: `GET /api/v1/payments/vnpay-return`
  - AI Shopping Assistant: `POST /api/v1/ai/chat`, `POST /api/v1/ai/chat/stream` (`/api/v1/ai/**`)
- **Admin Endpoint Pattern (`.hasRole("ADMIN")`):**
  - `/api/v1/admin/**`
- **Authenticated Endpoints (implicitly covered by `.anyRequest().authenticated()` or explicit matchers):**
  - Image Upload: `POST /api/v1/images/upload`
  - Apply Voucher: `POST /api/v1/vouchers/apply`
  - Auth Me & Profile: `GET /api/v1/auth/me`, `PUT /api/v1/auth/profile`, `POST /api/v1/auth/change-password`, `POST /api/v1/auth/logout`
  - Cart Operations: `/api/v1/cart/**`
  - Order Management: `/api/v1/orders/**`
  - Wishlist Management: `/api/v1/wishlist/**`
  - Review Management & Eligibility: `/api/v1/reviews/**`

---

## 3. Data & API Impact Matrix

| Endpoint / Pattern | HTTP Method | Access Level | Rationale |
|---|---|---|---|
| `/api/v1/auth/login`, `/api/v1/auth/register` | POST | Public (`permitAll`) | Authentication entry points |
| `/oauth2/**`, `/login/oauth2/**` | ANY | Public (`permitAll`) | Google OAuth2 flow handling |
| `/api/v1/products/**` | GET | Public (`permitAll`) | Guest browsing of products |
| `/api/v1/categories/**` | GET | Public (`permitAll`) | Guest browsing of categories |
| `/api/v1/banners` | GET | Public (`permitAll`) | Guest viewing hero banners |
| `/api/v1/vouchers` | GET | Public (`permitAll`) | Guest viewing public promotions |
| `/api/v1/products/*/reviews` | GET | Public (`permitAll`) | Guest viewing customer reviews |
| `/api/v1/payments/vnpay-return` | GET | Public (`permitAll`) | VNPAY payment redirect handling |
| `/api/v1/ai/**` | POST | Public (`permitAll`) | Guest asking AI for product advice |
| `/api/v1/admin/**` | ANY | Admin (`hasRole('ADMIN')`) | Admin portal endpoints |
| `/api/v1/images/upload` | POST | Authenticated | Prevent unauthenticated file uploads |
| `/api/v1/vouchers/apply` | POST | Authenticated | Coupon validation during checkout |
| `/api/v1/cart/**`, `/api/v1/orders/**`, `/api/v1/wishlist/**` | ANY | Authenticated | User cart, checkout, and wishlist |
| `/api/v1/reviews/**` | POST/PUT/DELETE/GET | Authenticated | Writing/editing reviews & eligibility check |
| All other endpoints | ANY | Authenticated (`authenticated()`) | Secure default baseline |

---

## 4. Verification & Testing Plan
1. **Compilation Check:** Run `./mvnw clean compile` (or `mvn compile`) in `backend` to ensure valid Spring Security annotations and Java imports.
2. **Public Endpoint Testing:**
   - Unauthenticated GET to `/api/v1/products` -> 200 OK
   - Unauthenticated GET to `/api/v1/banners` -> 200 OK
   - Unauthenticated POST to `/api/v1/ai/chat` -> 200 OK / processed
3. **Protected Endpoint Security Testing:**
   - Unauthenticated POST to `/api/v1/images/upload` -> 401 Unauthorized or 403 Forbidden
   - Unauthenticated POST to `/api/v1/vouchers/apply` -> 401 Unauthorized
   - Unauthenticated GET to `/api/v1/admin/dashboard/summary` -> 401 Unauthorized / 403 Forbidden
