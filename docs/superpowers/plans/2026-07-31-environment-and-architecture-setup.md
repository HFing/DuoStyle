# DuoStyle Environment and Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the containerized MySQL 8 environment, multi-stage Dockerfile, package architecture (Interface + Impl), RESTful Session-based authentication, core domain models, Cloudinary image upload integration, VNPay payment skeleton, and Admin Dashboard APIs for the DuoStyle e-commerce backend.

**Architecture:** Spring Boot Layered Architecture (Controller -> Service Interface/Impl -> Repository -> Entity) using Spring Data JPA for persistence, Spring Security with Session/Cookie management for RESTful auth, Docker Compose for MySQL 8, Cloudinary SDK for image hosting, and multi-stage Dockerfile.

**Tech Stack:** Java 25, Spring Boot 4.1, Spring Data JPA, Spring Security, MySQL 8.0, Lombok, Cloudinary SDK, Docker Compose, VNPay SDK/Config.

## Global Constraints
- Java version: 25.
- Build tool: Maven wrapper (`mvnw.cmd`).
- Spring Boot version: 4.1.0-SNAPSHOT.
- Service Layer Pattern: Must use Interface + ServiceImpl.
- Authentication: Session-based HTTP Cookie (`JSESSIONID`), NO JWT.
- API Envelopes: All REST responses wrapped in `ApiResponse<T>`.

---

### Task 1: Docker Compose & Application Configuration Setup

**Files:**
- Create: `docker-compose.yml`
- Modify: `src/main/resources/application.yaml`

**Interfaces:**
- Consumes: None
- Produces: MySQL 8.0 container on port 3306 and configured Spring Boot datasource properties.

- [ ] **Step 1: Create `docker-compose.yml`**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: duostyle-db
    restart: always
    environment:
      MYSQL_DATABASE: duostyle_db
      MYSQL_ROOT_PASSWORD: root
      MYSQL_USER: duostyle_user
      MYSQL_PASSWORD: duostyle_pass
    ports:
      - "3306:3306"
    volumes:
      - duostyle_mysql_data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

volumes:
  duostyle_mysql_data:
```

- [ ] **Step 2: Update `src/main/resources/application.yaml`**

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
    url: jdbc:mysql://localhost:3306/duostyle_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
    username: duostyle_user
    password: duostyle_pass
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
  tmn-code: "DEMO_TMN_CODE"
  hash-secret: "DEMO_HASH_SECRET"
  pay-url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
  return-url: "http://localhost:8080/api/v1/payments/vnpay-callback"
  api-url: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"

cloudinary:
  cloud-name: "demo_cloud"
  api-key: "demo_key"
  api-secret: "demo_secret"
```

- [ ] **Step 3: Test Docker Compose startup**

Run: `docker-compose up -d`
Expected: Container `duostyle-db` starts cleanly on port 3306.

---

### Task 2: Multi-Stage Dockerfile Setup

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Interfaces:**
- Consumes: Maven build & JDK 25 environment
- Produces: Docker image packaging Spring Boot executable JAR

- [ ] **Step 1: Create `.dockerignore`**

```text
.git
.mvn/wrapper/maven-wrapper.jar
target/
*.md
```

- [ ] **Step 2: Create `Dockerfile`**

```dockerfile
# Stage 1: Build application
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/DuoStyle-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### Task 3: Core Framework Utilities, Enums & Exception Handlers

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/enums/GenderTarget.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/enums/ClothingSize.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/enums/OrderStatus.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/enums/PaymentMethod.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/ApiResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/exception/CustomException.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/exception/GlobalExceptionHandler.java`

**Interfaces:**
- Consumes: None
- Produces: Enums, `ApiResponse<T>`, custom exceptions, and `@ControllerAdvice` for REST APIs.

- [ ] **Step 1: Create Enums (`GenderTarget`, `ClothingSize`, `OrderStatus`, `PaymentMethod`)**

`GenderTarget.java`:
```java
package com.DuoStyle.DuoStyle.enums;

public enum GenderTarget {
    MEN, WOMEN, UNISEX
}
```

`ClothingSize.java`:
```java
package com.DuoStyle.DuoStyle.enums;

public enum ClothingSize {
    XS, S, M, L, XL, XXL, FREE_SIZE
}
```

`OrderStatus.java`:
```java
package com.DuoStyle.DuoStyle.enums;

public enum OrderStatus {
    PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}
```

`PaymentMethod.java`:
```java
package com.DuoStyle.DuoStyle.enums;

public enum PaymentMethod {
    COD, VNPAY
}
```

- [ ] **Step 2: Create `ApiResponse.java`**

```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
```

- [ ] **Step 3: Create Exception Classes**

`CustomException.java`:
```java
package com.DuoStyle.DuoStyle.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {
    private final int status;

    public CustomException(int status, String message) {
        super(message);
        this.status = status;
    }
}
```

`GlobalExceptionHandler.java`:
```java
package com.DuoStyle.DuoStyle.exception;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(ApiResponse.error(ex.getStatus(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "Internal Server Error: " + ex.getMessage()));
    }
}
```

- [ ] **Step 4: Verify build with Maven**

Run: `mvnw.cmd clean compile`
Expected: BUILD SUCCESS.

---

### Task 4: User, Role & Spring Security Session Authentication Setup

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Role.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/User.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/repository/UserRepository.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/repository/RoleRepository.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/UserService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/UserServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/LoginRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/request/RegisterRequest.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/UserResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/AuthController.java`

**Interfaces:**
- Consumes: Spring Security & Session Manager
- Produces: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` endpoints.

- [ ] **Step 1: Create `User` & `Role` Entities**

`Role.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // ROLE_ADMIN, ROLE_CUSTOMER
}
```

`User.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;
    private String phone;
    private String gender;
    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 2: Create Repositories (`UserRepository`, `RoleRepository`)**

`UserRepository.java`:
```java
package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRoles_Name(String roleName);
}
```

`RoleRepository.java`:
```java
package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
```

- [ ] **Step 3: Create DTOs & Service (Interface + Impl)**

`LoginRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

`RegisterRequest.java`:
```java
package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String gender;
}
```

`UserResponse.java`:
```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String gender;
    private Set<String> roles;
}
```

`UserService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;

public interface UserService {
    UserResponse register(RegisterRequest request);
    UserResponse getUserByEmail(String email);
}
```

`UserServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.entity.Role;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.RoleRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(400, "Email already exists");
        }

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CUSTOMER").build()));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .gender(request.getGender())
                .roles(Set.of(customerRole))
                .enabled(true)
                .build();

        userRepository.save(user);

        return mapToResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "User not found"));
        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(user.getGender())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }
}
```

- [ ] **Step 4: Create `SecurityConfig.java` & `AuthController.java`**

`SecurityConfig.java`:
```java
package com.DuoStyle.DuoStyle.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                .requestMatchers("/api/v1/auth/**", "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/payments/**", "/api/v1/images/**", "/api/v1/admin/**").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
```

`AuthController.java`:
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.LoginRequest;
import com.DuoStyle.DuoStyle.dto.request.RegisterRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.UserResponse;
import com.DuoStyle.DuoStyle.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        HttpSession session = servletRequest.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

        UserResponse userResponse = userService.getUserByEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        UserResponse userResponse = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Current user info"));
    }
}
```

---

### Task 5: Category, Product, ProductVariant & Image Entities Setup

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Category.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Product.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/ProductVariant.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/ProductImage.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/repository/CategoryRepository.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/repository/ProductRepository.java`

**Interfaces:**
- Consumes: JPA & Enums (`GenderTarget`, `ClothingSize`)
- Produces: Data structures and JPA mapping for clothing catalog.

- [ ] **Step 1: Create Domain Entities (`Category`, `Product`, `ProductVariant`, `ProductImage`)**

`Category.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    private GenderTarget genderTarget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parentCategory;
}
```

`Product.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    private GenderTarget genderTarget;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariant> variants;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> images;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
```

`ProductVariant.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    private ClothingSize size;

    private String color;
    private String sku;

    private BigDecimal price;
    private Integer stockQuantity;
}
```

`ProductImage.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String imageUrl;
    private boolean isPrimary;
}
```

`ProductRepository.java`:
```java
package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

`CategoryRepository.java`:
```java
package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
```

---

### Task 6: Cart, Order & VNPay Payment Service Skeleton Setup

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Cart.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/CartItem.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Order.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/OrderItem.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/entity/Payment.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/repository/OrderRepository.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/config/VnPayConfig.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/PaymentService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/PaymentServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/PaymentController.java`

**Interfaces:**
- Consumes: Order metadata & VNPay HMAC SHA-512 signing logic.
- Produces: VNPay payment URL generation & callback handling endpoints.

- [ ] **Step 1: Create Cart, Order & Payment Entities**

`Order.java`:
```java
package com.DuoStyle.DuoStyle.entity;

import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private BigDecimal totalAmount;
    private String shippingAddress;
    private String phone;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    private LocalDateTime createdAt;
}
```

`OrderRepository.java`:
```java
package com.DuoStyle.DuoStyle.repository;

import com.DuoStyle.DuoStyle.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal sumTotalRevenue();

    List<Order> findTop5ByOrderByCreatedAtDesc();
}
```

- [ ] **Step 2: Create `VnPayConfig.java` & Payment Controller**

`VnPayConfig.java`:
```java
package com.DuoStyle.DuoStyle.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@Getter
public class VnPayConfig {
    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}
```

`PaymentService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {
    String createVnPayPaymentUrl(Long orderId, long amount, HttpServletRequest request);
}
```

`PaymentServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.config.VnPayConfig;
import com.DuoStyle.DuoStyle.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VnPayConfig vnPayConfig;

    @Override
    public String createVnPayPaymentUrl(Long orderId, long amount, HttpServletRequest request) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        String vnp_TxnRef = orderId + "_" + System.currentTimeMillis();
        String vnp_IpAddr = "127.0.0.1";

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + orderId);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }
}
```

`PaymentController.java`:
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/vnpay/{orderId}")
    public ResponseEntity<ApiResponse<String>> createVnPayUrl(@PathVariable Long orderId, @RequestParam long amount, HttpServletRequest request) {
        String paymentUrl = paymentService.createVnPayPaymentUrl(orderId, amount, request);
        return ResponseEntity.ok(ApiResponse.success(paymentUrl, "VNPay payment URL generated"));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<String>> vnpayCallback(@RequestParam("vnp_ResponseCode") String responseCode) {
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok(ApiResponse.success("SUCCESS", "Payment successful via VNPay"));
        }
        return ResponseEntity.status(400).body(ApiResponse.error(400, "Payment failed with response code: " + responseCode));
    }
}
```

---

### Task 7: Cloudinary Image Storage Integration Setup

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/config/CloudinaryConfig.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/CloudinaryService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/CloudinaryServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/ImageUploadController.java`

**Interfaces:**
- Consumes: MultipartFile upload & Cloudinary API keys.
- Produces: `POST /api/v1/images/upload` returning image CDN URL.

- [ ] **Step 1: Create `CloudinaryConfig.java`**

```java
package com.DuoStyle.DuoStyle.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
```

- [ ] **Step 2: Create Service & Controller**

`CloudinaryService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadImage(MultipartFile file);
}
```

`CloudinaryServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "duostyle_products"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new CustomException(500, "Failed to upload image to Cloudinary: " + e.getMessage());
        }
    }
}
```

`ImageUploadController.java`:
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success(imageUrl, "Image uploaded successfully to Cloudinary"));
    }
}
```

---

### Task 8: Admin Dashboard Statistics REST API Setup

**Files:**
- Create: `src/main/java/com/DuoStyle/DuoStyle/dto/response/DashboardResponse.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/AdminDashboardService.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/service/impl/AdminDashboardServiceImpl.java`
- Create: `src/main/java/com/DuoStyle/DuoStyle/controller/AdminDashboardController.java`

**Interfaces:**
- Consumes: UserRepository, OrderRepository, ProductRepository counts & stats.
- Produces: `GET /api/v1/admin/dashboard/stats` endpoint.

- [ ] **Step 1: Create `DashboardResponse.java`**

```java
package com.DuoStyle.DuoStyle.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;
}
```

- [ ] **Step 2: Create Service & Controller**

`AdminDashboardService.java`:
```java
package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;

public interface AdminDashboardService {
    DashboardResponse getDashboardStats();
}
```

`AdminDashboardServiceImpl.java`:
```java
package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.countByRoles_Name("ROLE_CUSTOMER");

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .build();
    }
}
```

`AdminDashboardController.java`:
```java
package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStats() {
        DashboardResponse stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved successfully"));
    }
}
```

- [ ] **Step 3: Verify full build with Maven**

Run: `mvnw.cmd clean compile`
Expected: BUILD SUCCESS.
