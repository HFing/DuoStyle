# Design Document: Product Review & Rating System (Đánh Giá và Phản Hồi Sản Phẩm)

**Date**: 2026-08-02  
**Status**: Proposal for User Review  

---

## 1. Overview & Business Objectives

Implementing a comprehensive **Product Review & Rating System (Đánh giá và Phản hồi)** for DuoStyle according to the provided Use Case specification:
1. Customers can rate (1-5 stars) and write text reviews (with optional Cloudinary photo uploads) **only for products from completed orders (`DELIVERED` status)**.
2. Customers can view, edit, or delete their own reviews.
3. The average star rating and review counts are prominently displayed on the **Product Detail Page** (`ProductDetailPage.tsx`) and product cards.
4. Admins can view all reviews, toggle review visibility (Hide/Unhide inappropriate content), and publish official Admin replies to customer reviews.

---

## 2. Architecture & Data Model

### Entity: `ProductReview`
Mapped to `product_reviews` table in MySQL database.

```java
@Entity
@Table(name = "product_reviews")
public class ProductReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Integer rating; // 1 to 5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String imageUrl; // Optional Cloudinary review photo

    @Column(columnDefinition = "TEXT")
    private String adminReply;

    private Boolean active = true; // Visibility flag (Admin can toggle)

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### DTO Extensions
1. **`ProductResponse` / `ProductDetailResponse`**:
   - `averageRating`: Double (e.g. `4.8`)
   - `reviewCount`: Integer (e.g. `12`)

2. **`ReviewRequest`**:
   - `productId`: Long
   - `orderId`: Long
   - `rating`: Integer (1-5)
   - `comment`: String
   - `imageUrl`: String (optional)

3. **`ReviewResponse`**:
   - `id`: Long
   - `productId`: Long
   - `productName`: String
   - `userId`: Long
   - `userFullName`: String
   - `rating`: Integer
   - `comment`: String
   - `imageUrl`: String
   - `adminReply`: String
   - `active`: Boolean
   - `createdAt`: LocalDateTime

4. **`AdminReplyRequest`**:
   - `adminReply`: String

---

## 3. REST API Endpoints

### Customer / Public Endpoints
- `GET /api/v1/products/{productId}/reviews`: Fetch active reviews for a product, along with rating summary (average rating, review count, rating distribution counts).
- `GET /api/v1/reviews/eligibility?productId={id}`: Check if logged-in customer has eligible `DELIVERED` orders for product `{id}`.
- `POST /api/v1/reviews`: Submit a new review.
  - **Validation Rules**:
    1. User must be authenticated (`ROLE_USER`).
    2. User must have an order containing `productId` with status `DELIVERED`.
    3. Prevents duplicate reviews for the same order item.
- `PUT /api/v1/reviews/{id}`: Edit own review.
- `DELETE /api/v1/reviews/{id}`: Delete own review.

### Admin Endpoints
- `GET /api/v1/admin/reviews`: List all reviews in the system with pagination and optional filtering by rating or keyword.
- `PATCH /api/v1/admin/reviews/{id}/toggle`: Toggle review active visibility (`active = true/false`).
- `POST /api/v1/admin/reviews/{id}/reply`: Add/update official Admin reply.

---

## 4. Frontend Integration & Design Aesthetics

### A. Product Detail Page (`ProductDetailPage.tsx`)
- **Rating Summary Badge**: Positioned below the product name (`⭐ 4.8 / 5.0 • 12 Đánh giá`).
- **Customer Reviews Section**:
  - Star distribution chart (5 stars, 4 stars, 3 stars, 2 stars, 1 star).
  - List of reviews showing customer name, star rating, creation date, review text, attached Cloudinary photo, and Admin response badge (if present).
  - Edit / Delete buttons for customer's own reviews.
  - **"Viết Đánh Giá"** button: Triggers `<WriteReviewModal />` if user has a verified `DELIVERED` order.

### B. Order Details & History (`OrderDetailModal.tsx` & `ProfilePage.tsx`)
- For orders in `DELIVERED` status, display a **"Đánh Giá Sản Phẩm"** button next to each delivered item to easily review directly from order details.

### C. Admin Dashboard (`AdminDashboardPage.tsx`)
- New Tab **"Quản Lý Đánh Giá"** in Admin Navigation Sidebar:
  - Table displaying product thumbnail, customer name, star rating, comment snippet, review status badge, and **"Phản Hồi"** modal button.

---

## 5. Verification Plan

1. **Automated Backend Tests (`ReviewServiceImplTest.java`)**:
   - Verify review creation with `DELIVERED` order requirement.
   - Verify rejection of reviews for un-delivered orders or non-buyers.
   - Verify calculation of average rating and review counts.
   - Verify Admin toggle active and reply functionality.
2. **Frontend & Full Suite Verification**:
   - Run `./mvnw.cmd test` to ensure 100% clean build.
