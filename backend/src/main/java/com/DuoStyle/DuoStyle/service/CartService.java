package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.AddToCartRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateCartItemRequest;
import com.DuoStyle.DuoStyle.dto.response.CartResponse;

public interface CartService {
    CartResponse getCartByUserEmail(String userEmail);
    CartResponse addToCart(String userEmail, AddToCartRequest request);
    CartResponse updateCartItem(String userEmail, Long cartItemId, UpdateCartItemRequest request);
    CartResponse removeCartItem(String userEmail, Long cartItemId);
    void clearCart(String userEmail);
}
