package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getUserWishlist(Authentication authentication) {
        List<ProductResponse> wishlist = wishlistService.getUserWishlist(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(wishlist, "Wishlist retrieved successfully"));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        wishlistService.addToWishlist(authentication.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        wishlistService.removeFromWishlist(authentication.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product removed from wishlist"));
    }
}
