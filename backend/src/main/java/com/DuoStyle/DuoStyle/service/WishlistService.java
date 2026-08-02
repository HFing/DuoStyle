package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {
    List<ProductResponse> getUserWishlist(String userEmail);
    void addToWishlist(String userEmail, Long productId);
    void removeFromWishlist(String userEmail, Long productId);
    boolean isInWishlist(String userEmail, Long productId);
}
