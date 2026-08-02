package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getUserWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ProductResponse> wishlist = wishlistService.getUserWishlist(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(wishlist, "Wishlist retrieved successfully"));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        wishlistService.addToWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product added to wishlist"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        wishlistService.removeFromWishlist(userDetails.getUsername(), productId);
        return ResponseEntity.ok(ApiResponse.success(null, "Product removed from wishlist"));
    }
}
