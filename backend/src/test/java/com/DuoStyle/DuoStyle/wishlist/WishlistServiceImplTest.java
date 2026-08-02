package com.DuoStyle.DuoStyle.wishlist;

import com.DuoStyle.DuoStyle.dto.response.ProductResponse;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.entity.Wishlist;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.repository.WishlistRepository;
import com.DuoStyle.DuoStyle.service.ProductService;
import com.DuoStyle.DuoStyle.service.impl.WishlistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceImplTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private WishlistServiceImpl wishlistService;

    private User user;
    private Product product;
    private Wishlist wishlist;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .build();

        product = Product.builder()
                .id(10L)
                .name("Váy Nữ Thời Trang")
                .build();

        wishlist = Wishlist.builder()
                .id(100L)
                .user(user)
                .product(product)
                .build();
    }

    @Test
    @DisplayName("getUserWishlist - Return product list in user wishlist")
    void testGetUserWishlist_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(wishlistRepository.findByUserId(1L)).thenReturn(List.of(wishlist));
        ProductResponse response = ProductResponse.builder().id(10L).name("Váy Nữ Thời Trang").build();
        when(productService.getProductById(10L)).thenReturn(response);

        List<ProductResponse> result = wishlistService.getUserWishlist("test@example.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Váy Nữ Thời Trang", result.get(0).getName());
    }

    @Test
    @DisplayName("addToWishlist - Successfully add product if not present")
    void testAddToWishlist_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(false);

        wishlistService.addToWishlist("test@example.com", 10L);

        verify(wishlistRepository, times(1)).save(any(Wishlist.class));
    }

    @Test
    @DisplayName("addToWishlist - Do not duplicate if product already in wishlist")
    void testAddToWishlist_AlreadyExists() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(wishlistRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(true);

        wishlistService.addToWishlist("test@example.com", 10L);

        verify(wishlistRepository, never()).save(any(Wishlist.class));
    }

    @Test
    @DisplayName("addToWishlist - Throw 404 when product not found")
    void testAddToWishlist_ProductNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                wishlistService.addToWishlist("test@example.com", 999L));

        assertEquals(404, exception.getStatus());
    }

    @Test
    @DisplayName("removeFromWishlist - Call repository delete")
    void testRemoveFromWishlist_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        wishlistService.removeFromWishlist("test@example.com", 10L);

        verify(wishlistRepository, times(1)).deleteByUserIdAndProductId(1L, 10L);
    }

    @Test
    @DisplayName("isInWishlist - Return true when product exists in wishlist")
    void testIsInWishlist_True() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(wishlistRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(true);

        assertTrue(wishlistService.isInWishlist("test@example.com", 10L));
    }
}
