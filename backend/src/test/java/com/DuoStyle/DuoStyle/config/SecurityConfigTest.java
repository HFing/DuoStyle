package com.DuoStyle.DuoStyle.config;

import com.DuoStyle.DuoStyle.security.GoogleOidcUserService;
import com.DuoStyle.DuoStyle.service.BannerService;
import com.DuoStyle.DuoStyle.service.CategoryService;
import com.DuoStyle.DuoStyle.service.ProductService;
import com.DuoStyle.DuoStyle.service.VoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private GoogleOidcUserService googleOidcUserService;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private CategoryService categoryService;

    @MockitoBean
    private BannerService bannerService;

    @MockitoBean
    private VoucherService voucherService;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

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
