# Security Config Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable `@EnableMethodSecurity` and transition `SecurityConfig.java` from a permissive `.anyRequest().permitAll()` baseline to a strict `.anyRequest().authenticated()` default policy with explicit public storefront endpoint mappings.

**Architecture:** Add Spring Security method security annotation to `SecurityConfig`, replace fallback `permitAll()` with `authenticated()`, and specify public read endpoints (`/products/**`, `/categories/**`, `/banners`, `/vouchers`, `/products/*/reviews`), public auth routes, VNPAY return, and AI chat.

**Tech Stack:** Java 17, Spring Boot 3.x, Spring Security 6.x, JUnit 5, MockMvc

## Global Constraints

- Preserve all existing public storefront browsing functionalities (Guest users can view products, categories, banners, vouchers, reviews, and query AI Chat).
- Restrict file uploads (`/api/v1/images/upload`) and voucher applications (`/api/v1/vouchers/apply`) to authenticated users.
- Ensure all unlisted/new endpoints default to requiring authentication (`401 Unauthorized` for unauthenticated requests).

---

### Task 1: Create Integration Security Test Suite

**Files:**
- Create: `backend/src/test/java/com/DuoStyle/DuoStyle/config/SecurityConfigTest.java`

**Interfaces:**
- Consumes: Spring Security MockMvc environment
- Produces: Test verification for public and protected URL routes and `@PreAuthorize` method security

- [ ] **Step 1: Write the failing test**

```java
package com.DuoStyle.DuoStyle.config;

import com.DuoStyle.DuoStyle.security.GoogleOidcUserService;
import com.DuoStyle.DuoStyle.service.BannerService;
import com.DuoStyle.DuoStyle.service.CategoryService;
import com.DuoStyle.DuoStyle.service.ProductService;
import com.DuoStyle.DuoStyle.service.VoucherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GoogleOidcUserService googleOidcUserService;

    @MockBean
    private ProductService productService;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private BannerService bannerService;

    @MockBean
    private VoucherService voucherService;

    @Test
    @DisplayName("Public storefront GET endpoints should be accessible without authentication")
    void testPublicEndpointsAllowedUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/banners"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/vouchers"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints should return 401 Unauthorized for unauthenticated requests")
    void testProtectedEndpointsDeniedUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/images/upload"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/vouchers/apply"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/admin/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin endpoints should return 403 Forbidden for non-admin users")
    @WithMockUser(username = "user@example.com", roles = {"USER"})
    void testAdminEndpointsForbiddenForNormalUser() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/summary"))
                .andExpect(status().isForbidden());
    }
}
```

- [ ] **Step 2: Run test to verify it fails on currently permissive endpoints**

Run: `./mvnw test -Dtest=SecurityConfigTest`
Expected: FAIL on `testProtectedEndpointsDeniedUnauthenticated` because `/api/v1/images/upload` currently returns 400 (or non-401) due to `.anyRequest().permitAll()`.

- [ ] **Step 3: Commit test suite draft**

```bash
git add backend/src/test/java/com/DuoStyle/DuoStyle/config/SecurityConfigTest.java
git commit -m "test: add SecurityConfigTest to verify URL security policies"
```

---

### Task 2: Hardening SecurityConfig & Activating Method Security

**Files:**
- Modify: `backend/src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java:26-88`

**Interfaces:**
- Consumes: Spring Security HttpSecurity configuration
- Produces: Hardened SecurityFilterChain & enabled `@EnableMethodSecurity`

- [ ] **Step 1: Update SecurityConfig.java**

Update `SecurityConfig.java` to add `@EnableMethodSecurity` and refine `authorizeHttpRequests`:

```java
package com.DuoStyle.DuoStyle.config;

import com.DuoStyle.DuoStyle.security.GoogleOidcUserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   AuthenticationProvider authenticationProvider,
                                                   GoogleOidcUserService googleOidcUserService,
                                                   @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authenticationProvider(authenticationProvider)
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/products/**", "/api/v1/categories/**", "/api/v1/banners", "/api/v1/vouchers").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/products/*/reviews").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/vnpay-return").permitAll()
                .requestMatchers("/api/v1/ai/**").permitAll()
                
                // Admin Only Endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // Authenticated Endpoints Baseline
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                    .userInfoEndpoint(userInfo -> userInfo.oidcUserService(googleOidcUserService))
                    .defaultSuccessUrl(frontendUrl + "/?googleLogin=success", true)
                    .failureUrl(frontendUrl + "/?googleLogin=error"));

        return http.build();
    }
}
```

- [ ] **Step 2: Run test suite to verify all tests pass**

Run: `./mvnw test -Dtest=SecurityConfigTest`
Expected: PASS for all tests in `SecurityConfigTest`.

- [ ] **Step 3: Run full backend test suite to ensure no regressions**

Run: `./mvnw test`
Expected: BUILD SUCCESS with 100% passing tests.

- [ ] **Step 4: Commit hardened configuration**

```bash
git add backend/src/main/java/com/DuoStyle/DuoStyle/config/SecurityConfig.java
git commit -m "security: enable method security and enforce authenticated default policy in SecurityConfig"
```
