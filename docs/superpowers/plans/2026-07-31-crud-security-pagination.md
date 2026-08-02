# DuoStyle CRUD APIs, Security Permissions & Order Tracking Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full RESTful CRUD for Products & Categories, Cart management, Order placement & tracking history with pagination, updated Spring Security role-based authorization rules, and `.env` configuration.

**Architecture:** Spring Boot Layered Architecture with `Pageable` & `PageResponse<T>` pagination envelope, Spring Security URL pattern authorization, DTOs & Mappers, and Service Interface + Impl.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring Data JPA (Pagination & Sorting), Spring Security, Lombok.

## Global Constraints
- Java version: 25.
- Build tool: Maven wrapper (`./mvnw.cmd`).
- Service Layer Pattern: Must use Interface + ServiceImpl.
- Public Endpoints: Product browsing & Category reading are public (no authentication required).
- User Endpoints: Cart, Order placement, Order history (`GET /api/v1/orders/my-orders`), and Tracking (`GET /api/v1/orders/{orderCode}`) require authentication.
- Admin Endpoints: Admin CRUD & Order status management require `ROLE_ADMIN`.

---

### Task 1: Environment Variables Setup (`.env` & `application.yaml`)

**Files:**
- Create: `.env`
- Modify: `src/main/resources/application.yaml`

**Interfaces:**
- Consumes: None
- Produces: Environment variable mapping for DB, VNPay, and Cloudinary properties.

- [ ] **Step 1: Create `.env` file**

```env
DB_URL=jdbc:mysql://localhost:3306/duostyle_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
DB_USERNAME=duostyle_user
DB_PASSWORD=duostyle_pass

VNP_TMN_CODE=DEMO_TMN_CODE
VNP_HASH_SECRET=DEMO_HASH_SECRET
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:8080/api/v1/payments/vnpay-callback

CLOUDINARY_CLOUD_NAME=demo_cloud
CLOUDINARY_API_KEY=demo_key
CLOUDINARY_API_SECRET=demo_secret
```

- [ ] **Step 2: Update `src/main/resources/application.yaml` to read from environment variables with defaults**

```yaml
server:
  port: 8080
  servlet:
    session:
      timeout: 30m
      cookie:
        name: JSESSIONID
        http-only: true
        secure: false

spring:
  application:
    name: DuoStyle
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/duostyle_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8}
    username: ${DB_USERNAME:duostyle_user}
    password: ${DB_PASSWORD:duostyle_pass}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect

vnpay:
  tmn-code: ${VNP_TMN_CODE:DEMO_TMN_CODE}
  hash-secret: ${VNP_HASH_SECRET:DEMO_HASH_SECRET}
  pay-url: ${VNP_PAY_URL:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}
  return-url: ${VNP_RETURN_URL:http://localhost:8080/api/v1/payments/vnpay-callback}

cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME:demo_cloud}
  api-key: ${CLOUDINARY_API_KEY:demo_key}
  api-secret: ${CLOUDINARY_API_SECRET:demo_secret}
```

---

### Task 2: Pagination Envelope DTO (`PageResponse<T>`)

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/PageResponse.java`

**Interfaces:**
- Consumes: Spring Data `Page<T>`
- Produces: `PageResponse<T>` pagination metadata envelope.

- [ ] **Step 1: Create `PageResponse.java`**

```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNo;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <T> PageResponse<T> fromPage(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
```

---

### Task 3: Spring Security Permission Rules Update

**Files:**
- Modify: `src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java`

**Interfaces:**
- Consumes: HTTP Security patterns
- Produces: Public product/category browsing, authenticated user orders/cart, and admin role restrictions.

- [ ] **Step 1: Update `SecurityConfig.java` authorization rules**

```java
package com.DuoStyle.DuoStyle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**").permitAll()
                .requestMatchers("/api/v1/payments/vnpay-callback").permitAll()
                
                // Admin Only Endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // Customer Authenticated Endpoints
                .requestMatchers("/api/v1/cart/**", "/api/v1/orders/**").authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

---

### Task 4: Category CRUD Services & Controllers

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/CategoryRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/CategoryResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/CategoryService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/CategoryServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/CategoryController.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/AdminCategoryController.java`

**Interfaces:**
- Consumes: `CategoryRepository`
- Produces: Public category listing & Admin category CRUD endpoints.

- [ ] **Step 1: Create Category DTOs & Service Interface**

`CategoryRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String slug;
    private GenderTarget genderTarget;
    private Long parentId;
}
```

`CategoryResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private GenderTarget genderTarget;
    private Long parentId;
}
```

`CategoryService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
```

- [ ] **Step 2: Implement `CategoryServiceImpl.java` and Controllers**

`CategoryServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Category not found"));
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .genderTarget(request.getGenderTarget())
                .build();
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Category not found"));
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setGenderTarget(request.getGenderTarget());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .genderTarget(category.getGenderTarget())
                .parentId(category.getParentCategory() != null ? category.getParentCategory().getId() : null)
                .build();
    }
}
```

`CategoryController.java` (Public):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories(), "Categories retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id), "Category retrieved successfully"));
    }
}
```

`AdminCategoryController.java` (Admin):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.CategoryRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.CategoryResponse;
import com.DuoStyle.DuoStyle.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createCategory(request), "Category created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(id, request), "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
```

---

### Task 5: Product CRUD Services with Pagination & Filtering

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/ProductRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/ProductVariantRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/ProductResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/ProductVariantResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/ProductService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/ProductServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/ProductController.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/AdminProductController.java`

**Interfaces:**
- Consumes: `ProductRepository`, `Pageable`
- Produces: Public paginated product catalog and Admin product management endpoints.

- [ ] **Step 1: Create Product DTOs & Service Interface**

`ProductVariantRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private ClothingSize size;
    private String color;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
}
```

`ProductRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private GenderTarget genderTarget;
    private Long categoryId;
    private List<ProductVariantRequest> variants;
}
```

`ProductVariantResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductVariantResponse {
    private Long id;
    private ClothingSize size;
    private String color;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
}
```

`ProductResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private GenderTarget genderTarget;
    private Long categoryId;
    private String categoryName;
    private List<ProductVariantResponse> variants;
}
```

`ProductService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.enums.GenderTarget;

public interface ProductService {
    PageResponse<ProductResponse> getProducts(int page, int size, String sortBy, String sortDir, Long categoryId, GenderTarget gender);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
```

- [ ] **Step 2: Implement `ProductServiceImpl.java` & Product Controllers**

`ProductServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductVariantResponse;
import com.DuoStyle.DuoStyle.entity.Category;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CategoryRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<ProductResponse> getProducts(int page, int size, String sortBy, String sortDir, Long categoryId, GenderTarget gender) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> productPage = productRepository.findAll(pageable);
        Page<ProductResponse> responsePage = productPage.map(this::mapToResponse);

        return PageResponse.fromPage(responsePage);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Product not found"));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .thumbnailUrl(request.getThumbnailUrl())
                .genderTarget(request.getGenderTarget())
                .category(category)
                .build();

        if (request.getVariants() != null) {
            List<ProductVariant> variants = request.getVariants().stream().map(v -> ProductVariant.builder()
                    .product(product)
                    .size(v.getSize())
                    .color(v.getColor())
                    .sku(v.getSku())
                    .price(v.getPrice() != null ? v.getPrice() : request.getBasePrice())
                    .stockQuantity(v.getStockQuantity())
                    .build()).toList();
            product.setVariants(variants);
        }

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Product not found"));

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setGenderTarget(request.getGenderTarget());

        productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        List<ProductVariantResponse> variantResponses = product.getVariants() != null ?
                product.getVariants().stream().map(v -> ProductVariantResponse.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .color(v.getColor())
                        .sku(v.getSku())
                        .price(v.getPrice())
                        .stockQuantity(v.getStockQuantity())
                        .build()).toList() : Collections.emptyList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .basePrice(product.getBasePrice())
                .thumbnailUrl(product.getThumbnailUrl())
                .genderTarget(product.getGenderTarget())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .variants(variantResponses)
                .build();
    }
}
```

`ProductController.java` (Public):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.enums.GenderTarget;
import com.DuoStyle.DuoStyle.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) GenderTarget gender
    ) {
        PageResponse<ProductResponse> products = productService.getProducts(page, size, sortBy, sortDir, categoryId, gender);
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id), "Product retrieved successfully"));
    }
}
```

`AdminProductController.java` (Admin):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.ProductRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(request), "Product created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, request), "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
```

---

### Task 6: Order Placement, History & Status Tracking Services

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/CreateOrderRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/OrderItemRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/OrderResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/OrderItemResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/OrderService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/OrderServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/OrderController.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/AdminOrderController.java`

**Interfaces:**
- Consumes: `OrderRepository`, `UserRepository`, `ProductVariantRepository`
- Produces: Order placement, user order history with pagination, order status tracking, and admin order status updates.

- [ ] **Step 1: Create Order DTOs & Service Interface**

`OrderItemRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productVariantId;
    private Integer quantity;
}
```

`CreateOrderRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String shippingAddress;
    private String phone;
    private PaymentMethod paymentMethod;
    private List<OrderItemRequest> items;
}
```

`OrderItemResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private String productName;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer quantity;
}
```

`OrderResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String phone;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl; // Provided if VNPay payment method
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
```

`OrderService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;

public interface OrderService {
    OrderResponse createOrder(String userEmail, CreateOrderRequest request, HttpServletRequest servletRequest);
    PageResponse<OrderResponse> getUserOrders(String userEmail, int page, int size);
    OrderResponse getOrderByCode(String userEmail, String orderCode);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
}
```

- [ ] **Step 2: Implement `OrderServiceImpl.java` & Order Controllers**

`OrderServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.OrderItemResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.OrderService;
import com.DuoStyle.DuoStyle.service.PaymentService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final EntityManager entityManager;

    @Override
    public OrderResponse createOrder(String userEmail, CreateOrderRequest request, HttpServletRequest servletRequest) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        String orderCode = "DS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhone())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        for (var itemReq : request.getItems()) {
            ProductVariant variant = entityManager.find(ProductVariant.class, itemReq.getProductVariantId());
            if (variant == null) {
                throw new CustomException(404, "Product variant not found: " + itemReq.getProductVariantId());
            }

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .size(variant.getSize() != null ? variant.getSize().name() : "FREE")
                    .color(variant.getColor())
                    .price(variant.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        orderRepository.save(order);

        String paymentUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            paymentUrl = paymentService.createVnPayPaymentUrl(order.getId(), totalAmount.longValue(), servletRequest);
        }

        OrderResponse response = mapToResponse(order);
        response.setPaymentUrl(paymentUrl);
        return response;
    }

    @Override
    public PageResponse<OrderResponse> getUserOrders(String userEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findAll(pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToResponse);
        return PageResponse.fromPage(responsePage);
    }

    @Override
    public OrderResponse getOrderByCode(String userEmail, String orderCode) {
        Order order = orderRepository.findAll().stream()
                .filter(o -> o.getOrderCode().equalsIgnoreCase(orderCode))
                .findFirst()
                .orElseThrow(() -> new CustomException(404, "Order not found"));

        return mapToResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(404, "Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream().map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productName(i.getProductName())
                        .size(i.getSize())
                        .color(i.getColor())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .build()).toList() : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
```

`OrderController.java` (Customer authenticated):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @RequestBody CreateOrderRequest request,
            HttpServletRequest servletRequest
    ) {
        OrderResponse response = orderService.createOrder(authentication.getName(), request, servletRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Order created successfully"));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getUserOrders(authentication.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(orders, "Order history retrieved successfully"));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        OrderResponse order = orderService.getOrderByCode(authentication.getName(), orderCode);
        return ResponseEntity.ok(ApiResponse.success(order, "Order status & details retrieved successfully"));
    }
}
```

`AdminOrderController.java` (Admin):
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated successfully"));
    }
}
```

---

### Task 7: Full Verification & Build Check

- [ ] **Step 1: Run Maven compilation**

Run: `./mvnw.cmd clean compile`
Expected: BUILD SUCCESS with 0 compilation errors.
