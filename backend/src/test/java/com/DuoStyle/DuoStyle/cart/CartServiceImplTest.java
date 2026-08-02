package com.DuoStyle.DuoStyle.cart;

import com.DuoStyle.DuoStyle.dto.request.AddToCartRequest;
import com.DuoStyle.DuoStyle.dto.request.UpdateCartItemRequest;
import com.DuoStyle.DuoStyle.dto.response.CartResponse;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.CartItem;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.enums.ClothingSize;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CartItemRepository;
import com.DuoStyle.DuoStyle.repository.CartRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.impl.CartServiceImpl;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private CartServiceImpl cartService;

    private User user;
    private Cart cart;
    private Product product;
    private ProductVariant variant;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .fullName("Test User")
                .build();

        cart = Cart.builder()
                .id(100L)
                .user(user)
                .items(new ArrayList<>())
                .build();

        product = Product.builder()
                .id(10L)
                .name("Áo Sơ Mi Nam")
                .thumbnailUrl("http://example.com/image.jpg")
                .build();

        variant = ProductVariant.builder()
                .id(20L)
                .product(product)
                .size(ClothingSize.L)
                .color("Trắng")
                .price(BigDecimal.valueOf(250000))
                .stockQuantity(50)
                .build();

        cartItem = CartItem.builder()
                .id(500L)
                .cart(cart)
                .productVariant(variant)
                .quantity(2)
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
    @DisplayName("getCartByUserEmail - Return existing cart when found")
    void testGetCartByUserEmail_ExistingCart() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));

        CartResponse response = cartService.getCartByUserEmail("user@example.com");

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getTotalItems());
        assertEquals(BigDecimal.valueOf(500000), response.getTotalPrice());
    }

    @Test
    @DisplayName("getCartByUserEmail - Create new cart when not found")
    void testGetCartByUserEmail_CreateNewCart() {
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> {
            Cart c = i.getArgument(0);
            c.setId(101L);
            return c;
        });

        CartResponse response = cartService.getCartByUserEmail("user@example.com");

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(0, response.getTotalItems());
        assertEquals(BigDecimal.ZERO, response.getTotalPrice());
    }

    @Test
    @DisplayName("getCartByUserEmail - Throw 404 when user does not exist")
    void testGetCartByUserEmail_UserNotFound() {
        when(cartRepository.findByUser_Email("unknown@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                cartService.getCartByUserEmail("unknown@example.com"));

        assertEquals(404, exception.getStatus());
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    @DisplayName("addToCart - Successfully add new variant to cart")
    void testAddToCart_AddNewItem() {
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(entityManager.find(ProductVariant.class, 20L)).thenReturn(variant);
        when(cartRepository.save(any(Cart.class))).thenReturn(cart);

        AddToCartRequest request = createAddReq(20L, 3);
        CartResponse response = cartService.addToCart("user@example.com", request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(3, response.getTotalItems());
        assertEquals(BigDecimal.valueOf(750000), response.getTotalPrice());
    }

    @Test
    @DisplayName("addToCart - Increment quantity if variant already in cart")
    void testAddToCart_IncrementExistingItem() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(entityManager.find(ProductVariant.class, 20L)).thenReturn(variant);

        AddToCartRequest request = createAddReq(20L, 1);
        CartResponse response = cartService.addToCart("user@example.com", request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(3, response.getTotalItems()); // 2 + 1
    }

    @Test
    @DisplayName("addToCart - Throw 404 when variant not found")
    void testAddToCart_VariantNotFound() {
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(entityManager.find(ProductVariant.class, 999L)).thenReturn(null);

        AddToCartRequest request = createAddReq(999L, 1);
        CustomException exception = assertThrows(CustomException.class, () ->
                cartService.addToCart("user@example.com", request));

        assertEquals(404, exception.getStatus());
    }

    @Test
    @DisplayName("updateCartItem - Update item quantity successfully")
    void testUpdateCartItem_Success() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(500L)).thenReturn(Optional.of(cartItem));

        UpdateCartItemRequest request = createUpdateReq(5);
        CartResponse response = cartService.updateCartItem("user@example.com", 500L, request);

        assertNotNull(response);
        assertEquals(5, cartItem.getQuantity());
        verify(cartItemRepository, times(1)).save(cartItem);
    }

    @Test
    @DisplayName("updateCartItem - Delete item when quantity <= 0")
    void testUpdateCartItem_DeleteWhenZeroQuantity() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(500L)).thenReturn(Optional.of(cartItem));

        UpdateCartItemRequest request = createUpdateReq(0);
        CartResponse response = cartService.updateCartItem("user@example.com", 500L, request);

        assertNotNull(response);
        assertFalse(cart.getItems().contains(cartItem));
        verify(cartItemRepository, times(1)).delete(cartItem);
    }

    @Test
    @DisplayName("updateCartItem - Throw 403 when cart item belongs to another user cart")
    void testUpdateCartItem_AccessDenied() {
        Cart otherCart = Cart.builder().id(999L).build();
        CartItem otherCartItem = CartItem.builder().id(500L).cart(otherCart).build();

        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(500L)).thenReturn(Optional.of(otherCartItem));

        UpdateCartItemRequest request = createUpdateReq(2);
        CustomException exception = assertThrows(CustomException.class, () ->
                cartService.updateCartItem("user@example.com", 500L, request));

        assertEquals(403, exception.getStatus());
    }

    @Test
    @DisplayName("removeCartItem - Remove item successfully")
    void testRemoveCartItem_Success() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(500L)).thenReturn(Optional.of(cartItem));

        CartResponse response = cartService.removeCartItem("user@example.com", 500L);

        assertNotNull(response);
        assertFalse(cart.getItems().contains(cartItem));
        verify(cartItemRepository, times(1)).delete(cartItem);
    }

    @Test
    @DisplayName("clearCart - Clear all items in cart")
    void testClearCart_Success() {
        cart.getItems().add(cartItem);
        when(cartRepository.findByUser_Email("user@example.com")).thenReturn(Optional.of(cart));

        cartService.clearCart("user@example.com");

        assertTrue(cart.getItems().isEmpty());
        verify(cartRepository, times(1)).save(cart);
    }
}
