package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.entity.Wishlist;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.repository.WishlistRepository;
import com.DuoStyle.DuoStyle.service.ProductService;
import com.DuoStyle.DuoStyle.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    public List<ProductResponse> getUserWishlist(String userEmail) {
        User user = getUser(userEmail);
        List<Wishlist> wishlists = wishlistRepository.findByUserId(user.getId());
        return wishlists.stream()
                .map(w -> productService.getProductById(w.getProduct().getId()))
                .toList();
    }

    @Override
    @Transactional
    public void addToWishlist(String userEmail, Long productId) {
        User user = getUser(userEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(404, "Product not found"));

        if (!wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            Wishlist wishlist = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .createdAt(LocalDateTime.now())
                    .build();
            wishlistRepository.save(wishlist);
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(String userEmail, Long productId) {
        User user = getUser(userEmail);
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Override
    public boolean isInWishlist(String userEmail, Long productId) {
        User user = getUser(userEmail);
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "User not found"));
    }
}
