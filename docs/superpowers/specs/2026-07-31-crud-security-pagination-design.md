# Design Specification: DuoStyle CRUD APIs, Security Permissions, Order Tracking & Pagination

**Date:** 2026-07-31  
**Project:** DuoStyle E-Commerce Backend  
**Focus:** Full RESTful CRUD, Security Authorization Rules, Order Tracking & History, Pagination, `.env` Configuration.

---

## 1. Security & Authorization Rules (`SecurityConfig.java`)

1. **Role Definition**:
   - `ROLE_ADMIN`: Full access to management endpoints (`/api/v1/admin/**`).
   - `ROLE_CUSTOMER`: Access to personal cart, order placement, order history, order progress tracking.
2. **Endpoint Permissions Table**:

| Endpoint Pattern | Method | Permitted Role | Purpose |
|---|---|---|---|
| `/api/v1/auth/login`, `/register` | POST | Public | User authentication & registration |
| `/api/v1/products/**` | GET | Public | Browse product catalog, search, filter |
| `/api/v1/categories/**` | GET | Public | View categories tree & details |
| `/api/v1/payments/vnpay-callback` | GET | Public | VNPay IPN/Return callback |
| `/api/v1/cart/**` | GET, POST, PUT, DELETE | Authenticated (`ROLE_CUSTOMER`, `ROLE_ADMIN`) | Manage shopping cart items |
| `/api/v1/orders` | POST | Authenticated | Checkout / Place order |
| `/api/v1/orders/my-orders` | GET | Authenticated | View current user's order history |
| `/api/v1/orders/{orderCode}` | GET | Authenticated | View order details & status timeline |
| `/api/v1/admin/categories/**` | POST, PUT, DELETE | `ROLE_ADMIN` | Category management |
| `/api/v1/admin/products/**` | POST, PUT, DELETE | `ROLE_ADMIN` | Product & variant management |
| `/api/v1/admin/orders/**` | GET, PUT | `ROLE_ADMIN` | Order management & status updates |
| `/api/v1/admin/dashboard/**` | GET | `ROLE_ADMIN` | Admin dashboard analytics |

---

## 2. Pagination Envelope (`PageResponse<T>`)

Standard pagination response structure for product catalog & order history:
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": {
    "content": [ ... ],
    "pageNo": 0,
    "pageSize": 10,
    "totalElements": 45,
    "totalPages": 5,
    "last": false
  },
  "timestamp": "2026-07-31T12:27:00Z"
}
```

---

## 3. Detailed REST API Specifications

### 3.1 Product API (`/api/v1/products`)
- `GET /api/v1/products`: Query params: `page` (default 0), `size` (default 10), `sortBy` (default `createdAt`), `sortDir` (`desc`/`asc`), `categoryId` (optional), `gender` (`MEN`/`WOMEN`/`UNISEX`), `search` (keyword).
- `GET /api/v1/products/{id}`: Detailed product with variants (Size, Color, Price, Stock) and images.
- `POST /api/v1/admin/products`: Create product with variants & images.
- `PUT /api/v1/admin/products/{id}`: Update product & variant details.
- `DELETE /api/v1/admin/products/{id}`: Delete product.

### 3.2 Category API (`/api/v1/categories`)
- `GET /api/v1/categories`: Get all categories.
- `POST /api/v1/admin/categories`: Create category.
- `PUT /api/v1/admin/categories/{id}`: Update category.
- `DELETE /api/v1/admin/categories/{id}`: Delete category.

### 3.3 Cart API (`/api/v1/cart`)
- `GET /api/v1/cart`: Get current user's cart.
- `POST /api/v1/cart/items`: Add product variant to cart (`productVariantId`, `quantity`).
- `PUT /api/v1/cart/items/{cartItemId}`: Update item quantity.
- `DELETE /api/v1/cart/items/{cartItemId}`: Remove item from cart.

### 3.4 Order & Tracking API (`/api/v1/orders`)
- `POST /api/v1/orders`: Create new order from cart. Request: `shippingAddress`, `phone`, `paymentMethod` (`COD`/`VNPAY`). Returns created order and VNPay URL if payment method is VNPAY.
- `GET /api/v1/orders/my-orders`: Returns paginated list of current user's orders (`PageResponse<OrderResponse>`).
- `GET /api/v1/orders/{orderCode}`: Retrieve order details, items, payment status, and status progression (`PENDING` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` / `CANCELLED`).
- `PUT /api/v1/admin/orders/{id}/status`: Admin updates order status (`status` param).

---

## 4. Environment Variables (`.env`)
Creation of root `.env` file containing database, VNPay, and Cloudinary secrets, mapped dynamically via `application.yaml`.
