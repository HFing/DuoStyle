package com.DuoStyle.DuoStyle.config;

import com.DuoStyle.DuoStyle.repository.*;
import com.DuoStyle.DuoStyle.service.CloudinaryService;
import com.DuoStyle.DuoStyle.entity.Banner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock CategoryRepository categoryRepository;
    @Mock ProductRepository productRepository;
    @Mock RoleRepository roleRepository;
    @Mock UserRepository userRepository;
    @Mock VoucherRepository voucherRepository;
    @Mock OrderRepository orderRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock CartRepository cartRepository;
    @Mock CartItemRepository cartItemRepository;
    @Mock WishlistRepository wishlistRepository;
    @Mock BannerRepository bannerRepository;
    @Mock CloudinaryService cloudinaryService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock ObjectMapper objectMapper;

    @InjectMocks DataInitializer initializer;

    @Test
    void resetDisabledDoesNotTouchDatabaseOrCloudinary() throws Exception {
        ReflectionTestUtils.setField(initializer, "resetEnabled", false);

        initializer.run();

        verifyNoInteractions(categoryRepository, productRepository, roleRepository, userRepository,
                voucherRepository, orderRepository, paymentRepository, cartRepository, cartItemRepository,
                wishlistRepository, bannerRepository, cloudinaryService, passwordEncoder, objectMapper);
    }

    @Test
    void cleanupUsesImmediateBulkDeletesBeforeReseedingUniqueRows() {
        ReflectionTestUtils.invokeMethod(initializer, "cleanDatabase");

        verify(roleRepository).deleteAllInBatch();
        verify(userRepository).deleteAllInBatch();
        verify(voucherRepository).deleteAllInBatch();
        verify(orderRepository).deleteAll();
        verify(orderRepository).flush();
    }

    @Test
    void seedBannersUploadsFourCoolmateImagesAndPersistsTheirCloudinaryUrls() {
        when(cloudinaryService.uploadSeedImageFromUrl(anyString(), anyString()))
                .thenAnswer(invocation -> "https://res.cloudinary.com/hfing/" + invocation.getArgument(1) + ".jpg");

        ReflectionTestUtils.invokeMethod(initializer, "seedBanners");

        var bannerCaptor = org.mockito.ArgumentCaptor.forClass(Banner.class);
        verify(bannerRepository, times(4)).save(bannerCaptor.capture());
        assertEquals(4, bannerCaptor.getAllValues().size());
        assertEquals("https://res.cloudinary.com/hfing/banner-coolmate-fifa-2026.jpg",
                bannerCaptor.getAllValues().getFirst().getImageUrl());
        assertEquals(4, bannerCaptor.getAllValues().getLast().getDisplayOrder());
    }
}
