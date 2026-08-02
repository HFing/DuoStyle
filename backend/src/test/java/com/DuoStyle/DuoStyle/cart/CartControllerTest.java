package com.DuoStyle.DuoStyle.cart;

import com.DuoStyle.DuoStyle.controller.CartController;
import com.DuoStyle.DuoStyle.dto.request.AddToCartRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateCartItemRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.CartResponse;
import com.DuoStyle.DuoStyle.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    @Mock
    private CartService cartService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CartController cartController;

    private CartResponse cartResponse;

    @BeforeEach
    void setUp() {
        cartResponse = CartResponse.builder()
                .id(1L)
                .totalPrice(BigDecimal.valueOf(250000))
                .totalItems(1)
                .items(List.of())
                .build();
    }

    private AddToCartRequest createAddReq(Long variantId, int qty) {
        AddToCartRequest req = new AddToCartRequest();
        req.setProductVariantId(variantId);
        req.setQuantity(qty);
        return req;
    }

    private UpdateCartItemRequest createUpdateReq(int qty) {
        UpdateCartItemRequest req = new UpdateCartItemRequest();
        req.setQuantity(qty);
        return req;
    }

    @Test
    @DisplayName("getCart - Successfully retrieve user cart")
    void testGetCart_Success() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(cartService.getCartByUserEmail("user@example.com")).thenReturn(cartResponse);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.getCart(authentication);

        assertNotNull(response.getBody());
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Cart retrieved successfully", response.getBody().getMessage());
        assertEquals(1L, response.getBody().getData().getId());
    }

    @Test
    @DisplayName("addToCart - Successfully add item to cart")
    void testAddToCart_Success() {
        when(authentication.getName()).thenReturn("user@example.com");
        AddToCartRequest request = createAddReq(10L, 2);
        when(cartService.addToCart("user@example.com", request)).thenReturn(cartResponse);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.addToCart(authentication, request);

        assertNotNull(response.getBody());
        assertEquals("Item added to cart successfully", response.getBody().getMessage());
    }

    @Test
    @DisplayName("updateCartItem - Successfully update cart item")
    void testUpdateCartItem_Success() {
        when(authentication.getName()).thenReturn("user@example.com");
        UpdateCartItemRequest request = createUpdateReq(3);
        when(cartService.updateCartItem("user@example.com", 100L, request)).thenReturn(cartResponse);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.updateCartItem(authentication, 100L, request);

        assertNotNull(response.getBody());
        assertEquals("Cart item updated successfully", response.getBody().getMessage());
    }

    @Test
    @DisplayName("removeCartItem - Successfully remove cart item")
    void testRemoveCartItem_Success() {
        when(authentication.getName()).thenReturn("user@example.com");
        when(cartService.removeCartItem("user@example.com", 100L)).thenReturn(cartResponse);

        ResponseEntity<ApiResponse<CartResponse>> response = cartController.removeCartItem(authentication, 100L);

        assertNotNull(response.getBody());
        assertEquals("Cart item removed successfully", response.getBody().getMessage());
    }

    @Test
    @DisplayName("clearCart - Successfully clear entire cart")
    void testClearCart_Success() {
        when(authentication.getName()).thenReturn("user@example.com");
        doNothing().when(cartService).clearCart("user@example.com");

        ResponseEntity<ApiResponse<Void>> response = cartController.clearCart(authentication);

        assertNotNull(response.getBody());
        assertEquals("Cart cleared successfully", response.getBody().getMessage());
    }
}
