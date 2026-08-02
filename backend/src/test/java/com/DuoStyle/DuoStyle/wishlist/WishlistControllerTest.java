package com.DuoStyle.DuoStyle.wishlist;

import com.DuoStyle.DuoStyle.controller.WishlistController;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistControllerTest {

    @Mock
    private WishlistService wishlistService;

    @InjectMocks
    private WishlistController wishlistController;

    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        userDetails = User.withUsername("test@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    @DisplayName("getUserWishlist - Retrieve user wishlist")
    void testGetUserWishlist_Success() {
        ProductResponse product = ProductResponse.builder().id(10L).name("Áo Thun").build();
        when(wishlistService.getUserWishlist("test@example.com")).thenReturn(List.of(product));

        ResponseEntity<ApiResponse<List<ProductResponse>>> response = wishlistController.getUserWishlist(userDetails);

        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Wishlist retrieved successfully", response.getBody().getMessage());
    }

    @Test
    @DisplayName("addToWishlist - Add product to wishlist")
    void testAddToWishlist_Success() {
        doNothing().when(wishlistService).addToWishlist("test@example.com", 10L);

        ResponseEntity<ApiResponse<Void>> response = wishlistController.addToWishlist(10L, userDetails);

        assertNotNull(response.getBody());
        assertEquals("Product added to wishlist", response.getBody().getMessage());
        verify(wishlistService, times(1)).addToWishlist("test@example.com", 10L);
    }

    @Test
    @DisplayName("removeFromWishlist - Remove product from wishlist")
    void testRemoveFromWishlist_Success() {
        doNothing().when(wishlistService).removeFromWishlist("test@example.com", 10L);

        ResponseEntity<ApiResponse<Void>> response = wishlistController.removeFromWishlist(10L, userDetails);

        assertNotNull(response.getBody());
        assertEquals("Product removed from wishlist", response.getBody().getMessage());
        verify(wishlistService, times(1)).removeFromWishlist("test@example.com", 10L);
    }
}
