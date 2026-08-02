package com.DuoStyle.DuoStyle.review;

import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;
import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.*;
import com.DuoStyle.DuoStyle.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User sampleUser;
    private User adminUser;
    private Product sampleProduct;
    private Order sampleOrder;
    private OrderItem sampleOrderItem;
    private ProductVariant sampleVariant;
    private ProductReview sampleReview;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("user@duostyle.com").fullName("Test User").build();
        
        Role adminRole = Role.builder().id(2L).name("ROLE_ADMIN").build();
        adminUser = User.builder().id(2L).email("admin@duostyle.com").fullName("Admin User").roles(Set.of(adminRole)).build();

        sampleProduct = Product.builder().id(10L).name("Áo Polo Coolmate").basePrice(new BigDecimal("350000")).build();
        sampleVariant = ProductVariant.builder().id(100L).product(sampleProduct).build();
        
        sampleOrderItem = OrderItem.builder().id(1000L).productVariant(sampleVariant).quantity(1).build();
        sampleOrder = Order.builder().id(50L).orderCode("DS-123456").user(sampleUser).status(OrderStatus.DELIVERED).items(List.of(sampleOrderItem)).build();

        sampleReview = ProductReview.builder()
                .id(500L)
                .product(sampleProduct)
                .user(sampleUser)
                .order(sampleOrder)
                .rating(5)
                .comment("Sản phẩm rất đẹp!")
                .active(true)
                .build();
    }

    // -------------------------------------------------------------------------
    // 1. getProductReviews Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getProductReviews - Success returns ProductReviewSummaryResponse with average rating")
    void testGetProductReviews_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(reviewRepository.findByProductIdAndActiveTrueOrderByCreatedAtDesc(10L)).thenReturn(List.of(sampleReview));
        when(reviewRepository.findAverageRatingByProductId(10L)).thenReturn(4.8);

        ProductReviewSummaryResponse response = reviewService.getProductReviews(10L);

        assertNotNull(response);
        assertEquals(10L, response.getProductId());
        assertEquals(4.8, response.getAverageRating());
        assertEquals(1, response.getTotalReviews());
        assertEquals(1, response.getReviews().size());
        assertEquals(1, response.getRatingDistribution().get(5));
    }

    @Test
    @DisplayName("getProductReviews - Throws 404 when product is not found")
    void testGetProductReviews_ProductNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.getProductReviews(999L));

        assertEquals(404, exception.getStatus());
        assertTrue(exception.getMessage().contains("Product not found"));
    }

    // -------------------------------------------------------------------------
    // 2. getEligibleOrderIdsForReview Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getEligibleOrderIdsForReview - Returns DELIVERED order IDs containing the product not yet reviewed")
    void testGetEligibleOrderIdsForReview_Success() {
        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(orderRepository.findByUserEmailOrderByCreatedAtDesc("user@duostyle.com")).thenReturn(List.of(sampleOrder));
        when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 10L, 50L)).thenReturn(false);

        List<Long> eligibleIds = reviewService.getEligibleOrderIdsForReview("user@duostyle.com", 10L);

        assertNotNull(eligibleIds);
        assertEquals(1, eligibleIds.size());
        assertEquals(50L, eligibleIds.get(0));
    }

    @Test
    @DisplayName("getEligibleOrderIdsForReview - Filters out already reviewed or non-delivered orders")
    void testGetEligibleOrderIdsForReview_FiltersUneligibleOrders() {
        Order processingOrder = Order.builder().id(51L).status(OrderStatus.PROCESSING).items(List.of(sampleOrderItem)).build();
        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(orderRepository.findByUserEmailOrderByCreatedAtDesc("user@duostyle.com")).thenReturn(List.of(sampleOrder, processingOrder));
        when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 10L, 50L)).thenReturn(true);

        List<Long> eligibleIds = reviewService.getEligibleOrderIdsForReview("user@duostyle.com", 10L);

        assertTrue(eligibleIds.isEmpty());
    }

    @Test
    @DisplayName("getEligibleOrderIdsForReview - Throws 404 when user not found")
    void testGetEligibleOrderIdsForReview_UserNotFound() {
        when(userRepository.findByEmail("unknown@duostyle.com")).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.getEligibleOrderIdsForReview("unknown@duostyle.com", 10L));

        assertEquals(404, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 3. createReview Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createReview - Success with explicit delivered orderId")
    void testCreateReview_Success_WithDeliveredOrder() {
        ReviewRequest request = ReviewRequest.builder()
                .productId(10L)
                .orderId(50L)
                .rating(5)
                .comment("Áo đẹp vừa vặn")
                .build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));
        when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 10L, 50L)).thenReturn(false);
        when(reviewRepository.save(any(ProductReview.class))).thenReturn(sampleReview);

        ReviewResponse response = reviewService.createReview("user@duostyle.com", request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        verify(reviewRepository, times(1)).save(any(ProductReview.class));
    }

    @Test
    @DisplayName("createReview - Success without orderId auto-resolves eligible order")
    void testCreateReview_Success_WithoutOrderId_AutoResolvesOrder() {
        ReviewRequest request = ReviewRequest.builder()
                .productId(10L)
                .rating(4)
                .comment("Chất vải thoáng mát")
                .build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findByUserEmailOrderByCreatedAtDesc("user@duostyle.com")).thenReturn(List.of(sampleOrder));
        when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 10L, 50L)).thenReturn(false);
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));
        when(reviewRepository.save(any(ProductReview.class))).thenReturn(sampleReview);

        ReviewResponse response = reviewService.createReview("user@duostyle.com", request);

        assertNotNull(response);
        verify(reviewRepository, times(1)).save(any(ProductReview.class));
    }

    @Test
    @DisplayName("createReview - Throws 400 when productId is missing")
    void testCreateReview_ThrowsException_MissingProductId() {
        ReviewRequest request = ReviewRequest.builder().rating(5).build();

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Product ID is required"));
    }

    @Test
    @DisplayName("createReview - Throws 400 when rating is out of range [1..5]")
    void testCreateReview_ThrowsException_InvalidRating() {
        ReviewRequest request = ReviewRequest.builder().productId(10L).rating(6).build();

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Rating must be between 1 and 5"));
    }

    @Test
    @DisplayName("createReview - Throws 400 when order is not DELIVERED")
    void testCreateReview_ThrowsException_WhenOrderNotDelivered() {
        sampleOrder.setStatus(OrderStatus.PROCESSING);
        ReviewRequest request = ReviewRequest.builder()
                .productId(10L)
                .orderId(50L)
                .rating(5)
                .comment("Áo đẹp vừa vặn")
                .build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("DELIVERED"));
    }

    @Test
    @DisplayName("createReview - Throws 403 when order belongs to another user")
    void testCreateReview_ThrowsException_OrderNotBelongToUser() {
        User anotherUser = User.builder().id(99L).email("other@duostyle.com").build();
        sampleOrder.setUser(anotherUser);

        ReviewRequest request = ReviewRequest.builder().productId(10L).orderId(50L).rating(5).build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(403, exception.getStatus());
        assertTrue(exception.getMessage().contains("Order does not belong to user"));
    }

    @Test
    @DisplayName("createReview - Throws 400 when product is not in specified order")
    void testCreateReview_ThrowsException_ProductNotInOrder() {
        Product otherProduct = Product.builder().id(999L).name("Khác").build();
        ReviewRequest request = ReviewRequest.builder().productId(999L).orderId(50L).rating(5).build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(999L)).thenReturn(Optional.of(otherProduct));
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("Sản phẩm không có trong đơn hàng"));
    }

    @Test
    @DisplayName("createReview - Throws 400 when user already reviewed the order")
    void testCreateReview_ThrowsException_AlreadyReviewed() {
        ReviewRequest request = ReviewRequest.builder().productId(10L).orderId(50L).rating(5).build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findById(50L)).thenReturn(Optional.of(sampleOrder));
        when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 10L, 50L)).thenReturn(true);

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("đã đánh giá"));
    }

    @Test
    @DisplayName("createReview - Throws 400 when no orderId provided and no eligible delivered orders exist")
    void testCreateReview_ThrowsException_NoEligibleOrders() {
        ReviewRequest request = ReviewRequest.builder().productId(10L).rating(5).build();

        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.findByUserEmailOrderByCreatedAtDesc("user@duostyle.com")).thenReturn(Collections.emptyList());

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.createReview("user@duostyle.com", request));

        assertEquals(400, exception.getStatus());
        assertTrue(exception.getMessage().contains("chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng"));
    }

    // -------------------------------------------------------------------------
    // 4. updateReview Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateReview - Success by review owner")
    void testUpdateReview_Success() {
        ReviewRequest request = ReviewRequest.builder().rating(4).comment("Đã sửa comment").imageUrl("http://newimage.png").build();

        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(i -> i.getArgument(0));

        ReviewResponse response = reviewService.updateReview("user@duostyle.com", 500L, request);

        assertNotNull(response);
        assertEquals(4, response.getRating());
        assertEquals("Đã sửa comment", response.getComment());
        assertEquals("http://newimage.png", response.getImageUrl());
    }

    @Test
    @DisplayName("updateReview - Throws 404 when review not found")
    void testUpdateReview_Throws404_ReviewNotFound() {
        ReviewRequest request = ReviewRequest.builder().rating(4).build();
        when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.updateReview("user@duostyle.com", 999L, request));

        assertEquals(404, exception.getStatus());
    }

    @Test
    @DisplayName("updateReview - Throws 403 when user is not the review author")
    void testUpdateReview_Throws403_NotOwner() {
        User otherUser = User.builder().id(88L).email("other@duostyle.com").build();
        ReviewRequest request = ReviewRequest.builder().rating(4).build();

        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("other@duostyle.com")).thenReturn(Optional.of(otherUser));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.updateReview("other@duostyle.com", 500L, request));

        assertEquals(403, exception.getStatus());
        assertTrue(exception.getMessage().contains("update your own review"));
    }

    @Test
    @DisplayName("updateReview - Throws 400 when updated rating is invalid")
    void testUpdateReview_Throws400_InvalidRating() {
        ReviewRequest request = ReviewRequest.builder().rating(0).build();

        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.updateReview("user@duostyle.com", 500L, request));

        assertEquals(400, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 5. deleteReview Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("deleteReview - Success by review owner")
    void testDeleteReview_Success_ByOwner() {
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("user@duostyle.com")).thenReturn(Optional.of(sampleUser));

        assertDoesNotThrow(() -> reviewService.deleteReview("user@duostyle.com", 500L));
        verify(reviewRepository, times(1)).delete(sampleReview);
    }

    @Test
    @DisplayName("deleteReview - Success by Admin user")
    void testDeleteReview_Success_ByAdmin() {
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("admin@duostyle.com")).thenReturn(Optional.of(adminUser));

        assertDoesNotThrow(() -> reviewService.deleteReview("admin@duostyle.com", 500L));
        verify(reviewRepository, times(1)).delete(sampleReview);
    }

    @Test
    @DisplayName("deleteReview - Throws 403 when user is neither owner nor admin")
    void testDeleteReview_Throws403_NotOwnerNorAdmin() {
        User regularUser = User.builder().id(99L).email("regular@duostyle.com").build();
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(userRepository.findByEmail("regular@duostyle.com")).thenReturn(Optional.of(regularUser));

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewService.deleteReview("regular@duostyle.com", 500L));

        assertEquals(403, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 6. getAllReviewsForAdmin Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getAllReviewsForAdmin - Success returns paginated review responses")
    void testGetAllReviewsForAdmin_Success() {
        Page<ProductReview> reviewPage = new PageImpl<>(List.of(sampleReview));
        when(reviewRepository.findAllForAdminSearch(eq("Polo"), eq(5), any(Pageable.class))).thenReturn(reviewPage);

        PageResponse<ReviewResponse> response = reviewService.getAllReviewsForAdmin("Polo", 5, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(1, response.getTotalElements());
        assertEquals(5, response.getContent().get(0).getRating());
    }

    // -------------------------------------------------------------------------
    // 7. toggleReviewActive & replyToReview Tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("toggleReviewActive - Success toggles active state")
    void testToggleReviewActive_Success() {
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(i -> i.getArgument(0));

        ReviewResponse response = reviewService.toggleReviewActive(500L);

        assertNotNull(response);
        assertFalse(response.getActive());
    }

    @Test
    @DisplayName("replyToReview - Success saves admin reply")
    void testReplyToReview_Success() {
        AdminReplyRequest request = AdminReplyRequest.builder().adminReply("Cảm ơn bạn đã tin tưởng DuoStyle!").build();
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(i -> i.getArgument(0));

        ReviewResponse response = reviewService.replyToReview(500L, request);

        assertNotNull(response);
        assertEquals("Cảm ơn bạn đã tin tưởng DuoStyle!", response.getAdminReply());
    }
}

