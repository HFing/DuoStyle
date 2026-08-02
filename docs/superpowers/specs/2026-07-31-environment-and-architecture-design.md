# Design Specification: DuoStyle E-Commerce Backend & Docker Setup

**Date:** 2026-07-31  
**Project:** DuoStyle (Men & Women Clothing E-Commerce Backend)  
**Tech Stack:** Java 25, Spring Boot 4.1, Spring Data JPA, Spring Security (Session-based Auth), MySQL 8.0, Docker Compose, VNPay Integration, Cloudinary Image Storage, Admin Dashboard APIs.

---

## 1. Executive Summary & Goals

DuoStyle is a fashion e-commerce backend built with Spring Boot providing a RESTful API for men's and women's clothing shopping. The primary objective of this setup phase is to establish:
1. A containerized MySQL database environment using Docker Compose.
2. Production-ready Dockerfile for Spring Boot container packaging.
3. Clean, modular RESTful API architecture following the `Interface` + `ServiceImpl` pattern.
4. Session-based authentication using Spring Security (Cookie JSESSIONID).
5. Comprehensive data domain models tailored for clothing attributes (Size, Color, Gender, Categories).
6. Integrated payment gateway infrastructure (COD & VNPay).
7. Cloudinary integration for image uploads (product images, thumbnails, category banners).
8. Admin Dashboard REST APIs for shop statistics and overview metrics.

---

## 2. Docker & Database Environment

### 2.1 `docker-compose.yml`
- **Service:** `mysql`
  - Container Name: `duostyle-db`
  - Image: `mysql:8.0`
  - Ports: `3306:3306`
  - Credentials & Database:
    - Database Name: `duostyle_db`
    - Root Password: `root`
    - Application User: `duostyle_user`
    - Application Password: `duostyle_pass`
  - Encoding: `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`
  - Volume: `duostyle_mysql_data:/var/lib/mysql`

### 2.2 `Dockerfile`
- Multi-stage build support for JDK 25.
  - Stage 1: Build JAR via Maven Wrapper (`./mvnw clean package -DskipTests`).
  - Stage 2: Runtime image exposing port `8080`.

### 2.3 `src/main/resources/application.yaml`
- Spring Datasource configuration targeting `jdbc:mysql://localhost:3306/duostyle_db`.
- Hibernate DDL mode: `update` for development.
- Server Port: `8080`.
- Cloudinary & VNPay properties configured.

---

## 3. Backend Architecture & Package Structure

### 3.1 Package Layout (`com.DuoStyle.DuoStyle`)
```text
com.DuoStyle.DuoStyle
├── config
│   ├── SecurityConfig.java         # Spring Security Session Auth & CORS Config
│   ├── VnPayConfig.java            # VNPay merchant credentials & URL hashing
│   ├── CloudinaryConfig.java       # Cloudinary client bean setup
│   └── WebConfig.java              # CORS mappings for frontend integration
├── controller
│   ├── AuthController.java         # Login, Logout, Me endpoints
│   ├── CategoryController.java     # Category management
│   ├── ProductController.java      # Product & Variant browsing
│   ├── CartController.java         # Cart management
│   ├── OrderController.java        # Order placement
│   ├── PaymentController.java      # VNPay payment initiation & callbacks
│   ├── ImageUploadController.java  # Cloudinary file upload API
│   └── AdminDashboardController.java # Admin statistics & overview dashboard
├── dto
│   ├── request                     # LoginRequest, CreateOrderRequest, etc.
│   └── response                    # ApiResponse<T>, DashboardResponse, UserResponse, etc.
├── entity
│   ├── User.java
│   ├── Role.java
│   ├── Category.java
│   ├── Product.java
│   ├── ProductVariant.java
│   ├── ProductImage.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   ├── OrderItem.java
│   └── Payment.java
├── enums
│   ├── GenderTarget.java           # MEN, WOMEN, UNISEX
│   ├── ClothingSize.java           # S, M, L, XL, XXL
│   ├── OrderStatus.java            # PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
│   └── PaymentMethod.java          # COD, VNPAY
├── exception
│   ├── CustomException.java
│   └── GlobalExceptionHandler.java
├── repository                      # Spring Data JPA Repositories
└── service                         # Business logic interfaces & implementations
    ├── UserService.java
    ├── CategoryService.java
    ├── ProductService.java
    ├── CartService.java
    ├── OrderService.java
    ├── PaymentService.java
    ├── CloudinaryService.java
    ├── AdminDashboardService.java
    └── impl
        ├── UserServiceImpl.java
        ├── CategoryServiceImpl.java
        ├── ProductServiceImpl.java
        ├── CartServiceImpl.java
        ├── OrderServiceImpl.java
        ├── PaymentServiceImpl.java
        ├── CloudinaryServiceImpl.java
        └── AdminDashboardServiceImpl.java
```

### 3.2 Standardized REST API Response format (`ApiResponse<T>`)
All endpoints return a uniform envelope:
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-07-31T12:16:00Z"
}
```

---

## 4. Cloudinary & Admin Dashboard Design

### 4.1 Cloudinary Image Storage
- `CloudinaryConfig`: Initializes Cloudinary bean with `cloud_name`, `api_key`, `api_secret`.
- `CloudinaryService` (`CloudinaryServiceImpl`): Method `uploadImage(MultipartFile file)` uploads image to Cloudinary and returns secure URL.
- `ImageUploadController`: Endpoint `POST /api/v1/images/upload` for multipart file uploads.

### 4.2 Admin Dashboard Statistics API
- `GET /api/v1/admin/dashboard/stats`: Returns `DashboardResponse`:
  - `totalRevenue`: Sum of completed order totals.
  - `totalOrders`: Count of all orders.
  - `totalProducts`: Count of active products.
  - `totalCustomers`: Count of registered users with `ROLE_CUSTOMER`.
  - `recentOrders`: List of top 5 recent orders.

---

## 5. Security & Authentication Design

1. **Authentication Mode:** RESTful HTTP Session Authentication via JSESSIONID cookie (No JWT).
2. **Key Auth Endpoints:**
   - `POST /api/v1/auth/login`: Accepts credentials, authenticates via Spring Security `AuthenticationManager`, creates HTTP session, returns user info and sends `JSESSIONID` cookie to client.
   - `POST /api/v1/auth/logout`: Invalidates HTTP Session & clears `SecurityContext`.
   - `GET /api/v1/auth/me`: Retrieves current authenticated user context.
3. **CORS Configuration:** `allowCredentials = true` enabled for cross-origin frontend requests.

---

## 6. Verification & Testing Strategy
1. **Docker Container Verification:** Run `docker-compose up -d` and inspect MySQL container.
2. **Build Verification:** Run `./mvnw clean compile` to ensure Java 25 & Cloudinary SDK compile cleanly.
3. **REST API Smoke Test:** Verify `/api/v1/auth/login`, `/api/v1/admin/dashboard/stats`, and JPA table auto-creation upon startup.
