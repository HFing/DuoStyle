# Data Seeding, Cloudinary Integration & Fake Orders Design Spec

**Date:** 2026-08-01  
**Feature:** Fresh Data Reseeding with Cloudinary Uploads & Fake Historical Orders  
**Status:** Approved  

---

## 1. Overview
This specification details the complete database cleanup, fresh Coolmate/Luxury fashion data seeding, automatic Cloudinary image uploads, and fake historical order generation for DuoStyle.

---

## 2. Architecture & Data Flow

```
[DataInitializer.java] 
       |
       +---> 1. Clean Database (Delete Cart, Wishlist, Orders, Products, Categories)
       |
       +---> 2. Create Roles (ROLE_ADMIN, ROLE_USER), Admin & Customer Accounts, Vouchers
       |
       +---> 3. Seed Fresh Categories (Men, Women, Accessories)
       |
       +---> 4. Seed 12+ Fashion Products & Upload Image URLs directly to Cloudinary (hfing)
       |         `--> CloudinaryServiceImpl.uploadImageFromUrl(imageUrl, "duostyle_products")
       |
       +---> 5. Generate 20+ Fake Historical Orders across last 60 days (DELIVERED/SHIPPED/COD/VNPAY)
```

---

## 3. Backend Implementation Details

### 3.1 Cloudinary Service Enhancement (`CloudinaryService.java` / `CloudinaryServiceImpl.java`)
Method: `String uploadImageFromUrl(String sourceUrl, String folder)`
- Uses `cloudinary.uploader().upload(sourceUrl, ObjectUtils.asMap("folder", folder))` to download external images (Coolmate/Unsplash HD) and store them directly in Cloudinary account `hfing`.
- Fallback gracefully to original URL if Cloudinary upload throws an error.

### 3.2 Database Cleanup (`DataInitializer.java`)
Delete in strict foreign key order:
1. `cartItemRepository.deleteAll()`, `cartRepository.deleteAll()`
2. `wishlistRepository.deleteAll()`
3. `orderItemRepository.deleteAll()`, `orderRepository.deleteAll()`
4. `productRepository.deleteAll()` (cascades or deletes `productImages` & `productVariants`)
5. `categoryRepository.deleteAll()`

### 3.3 Product Catalog Definition
Seed 12 high quality fashion products with full variants (Size, Color, Stock):
- **Men**: Polo Coolmate Promax, T-Shirt Cotton Compact, Shirt Oxford Anti-Wrinkle, Suit Wool Italian, Short Dailywear, Jacket Ultra-Light Anti-UV.
- **Women**: Silk Evening Gown, Dress Linen Midi, Blazer Double-Breasted, Silk Top Soft, Trouser Tailored High-Waist.
- **Accessories**: Structured Leather Bag, Automatic Buckle Leather Belt, Essence Noir EDP Perfume.

### 3.4 Fake Historical Order Generation
Seed 20+ orders spread from `LocalDateTime.now().minusDays(55)` to `now()`:
- Statuses: `DELIVERED` (80% for revenue stats), `SHIPPED`, `PROCESSING`, `PENDING`, `CANCELLED`.
- Payment Methods: `VNPAY`, `COD`.
- Realistic order amounts, shipping addresses, phone numbers, and timestamps.

---

## 4. Verification Plan

### Execution
Run backend application or unit test seeder to execute `DataInitializer`.

### Automated Verification
Run backend unit test suite:
```bash
./mvnw.cmd test
```
Expected result: All tests pass cleanly.
