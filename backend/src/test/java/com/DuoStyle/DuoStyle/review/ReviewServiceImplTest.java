package com.DuoStyle.DuoStyle.review;

import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;
import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.*;
import com.DuoStyle.DuoStyle.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    private Product sampleProduct;
    private Order sampleOrder;
    private OrderItem sampleOrderItem;
    private ProductVariant sampleVariant;
    private ProductReview sampleReview;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder().id(1L).email("user@duostyle.com").fullName("Test User").build();
        sampleProduct = Product.builder().id(10L).name("Áo Polo Coolmate").basePrice(new java.math.BigDecimal("350000")).build();
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

    @Test
    void testGetProductReviews_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(reviewRepository.findByProductIdAndActiveTrueOrderByCreatedAtDesc(10L)).thenReturn(List.of(sampleReview));
        when(reviewRepository.findAverageRatingByProductId(10L)).thenReturn(5.0);

        ProductReviewSummaryResponse response = reviewService.getProductReviews(10L);

        assertNotNull(response);
        assertEquals(10L, response.getProductId());
        assertEquals(5.0, response.getAverageRating());
        assertEquals(1, response.getTotalReviews());
        assertEquals(1, response.getReviews().size());
    }

    @Test
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

        assertTrue(exception.getMessage().contains("DELIVERED"));
    }

    @Test
    void testToggleReviewActive_Success() {
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(i -> i.getArguments()[0]);

        ReviewResponse response = reviewService.toggleReviewActive(500L);

        assertNotNull(response);
        assertFalse(response.getActive());
    }

    @Test
    void testReplyToReview_Success() {
        AdminReplyRequest request = AdminReplyRequest.builder().adminReply("Cảm ơn bạn đã tin tưởng DuoStyle!").build();
        when(reviewRepository.findById(500L)).thenReturn(Optional.of(sampleReview));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(i -> i.getArguments()[0]);

        ReviewResponse response = reviewService.replyToReview(500L, request);

        assertNotNull(response);
        assertEquals("Cảm ơn bạn đã tin tưởng DuoStyle!", response.getAdminReply());
    }
}
