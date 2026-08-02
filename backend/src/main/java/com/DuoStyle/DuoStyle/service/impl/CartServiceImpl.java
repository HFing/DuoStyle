package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.AddToCartRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateCartItemRequest;
import com.DuoStyle.DuoStyle.dto.response.CartItemResponse;
import com.DuoStyle.DuoStyle.dto.response.CartResponse;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.CartItem;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CartItemRepository;
import com.DuoStyle.DuoStyle.repository.CartRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.CartService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public CartResponse getCartByUserEmail(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String userEmail, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userEmail);
        ProductVariant variant = entityManager.find(ProductVariant.class, request.getProductVariantId());
        if (variant == null) {
            throw new CustomException(404, "Product variant not found: " + request.getProductVariantId());
        }

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(request.getProductVariantId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userEmail, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userEmail);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CustomException(404, "Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new CustomException(403, "Access denied to cart item");
        }

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }

        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String userEmail, Long cartItemId) {
        Cart cart = getOrCreateCart(userEmail);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CustomException(404, "Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new CustomException(403, "Access denied to cart item");
        }

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(String userEmail) {
        Cart cart = getOrCreateCart(userEmail);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String userEmail) {
        return cartRepository.findByUser_Email(userEmail)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(userEmail)
                            .orElseThrow(() -> new CustomException(404, "User not found"));
                    Cart newCart = Cart.builder().user(user).items(new ArrayList<>()).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalItems = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                ProductVariant variant = item.getProductVariant();
                BigDecimal itemPrice = variant.getPrice() != null ? variant.getPrice() : BigDecimal.ZERO;
                BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

                totalPrice = totalPrice.add(itemTotal);
                totalItems += item.getQuantity();

                itemResponses.add(CartItemResponse.builder()
                        .id(item.getId())
                        .productVariantId(variant.getId())
                        .productName(variant.getProduct() != null ? variant.getProduct().getName() : "Product")
                        .size(variant.getSize())
                        .color(variant.getColor())
                        .thumbnailUrl(variant.getProduct() != null ? variant.getProduct().getThumbnailUrl() : null)
                        .price(itemPrice)
                        .quantity(item.getQuantity())
                        .itemTotal(itemTotal)
                        .build());
            }
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalPrice(totalPrice)
                .totalItems(totalItems)
                .build();
    }
}
