package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.AddToCartRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateCartItemRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.CartResponse;
import com.DuoStyle.DuoStyle.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication authentication) {
        CartResponse cart = cartService.getCartByUserEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart retrieved successfully"));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            Authentication authentication,
            @RequestBody AddToCartRequest request
    ) {
        CartResponse cart = cartService.addToCart(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item added to cart successfully"));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartItemRequest request
    ) {
        CartResponse cart = cartService.updateCartItem(authentication.getName(), cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart item updated successfully"));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            Authentication authentication,
            @PathVariable Long cartItemId
    ) {
        CartResponse cart = cartService.removeCartItem(authentication.getName(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart item removed successfully"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared successfully"));
    }
}
