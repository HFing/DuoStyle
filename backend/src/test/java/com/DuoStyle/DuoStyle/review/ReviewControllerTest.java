package com.DuoStyle.DuoStyle.review;

import com.DuoStyle.DuoStyle.controller.ReviewController;
import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    private Authentication validAuth;
    private ReviewResponse sampleResponse;
    private ProductReviewSummaryResponse sampleSummaryResponse;

    @BeforeEach
    void setUp() {
        validAuth = new UsernamePasswordAuthenticationToken("user@duostyle.com", "password", Collections.emptyList());

        sampleResponse = ReviewResponse.builder()
                .id(500L)
                .productId(10L)
                .userEmail("user@duostyle.com")
                .rating(5)
                .comment("Sản phẩm tuyệt vời")
                .active(true)
                .build();

        sampleSummaryResponse = ProductReviewSummaryResponse.builder()
                .productId(10L)
                .averageRating(4.8)
                .totalReviews(1)
                .reviews(List.of(sampleResponse))
                .build();
    }

    // -------------------------------------------------------------------------
    // 1. Public Endpoint: getProductReviews
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getProductReviews - Returns summary response for product")
    void testGetProductReviews_Success() {
        when(reviewService.getProductReviews(10L)).thenReturn(sampleSummaryResponse);

        ResponseEntity<ProductReviewSummaryResponse> response = reviewController.getProductReviews(10L);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(10L, response.getBody().getProductId());
        assertEquals(4.8, response.getBody().getAverageRating());
    }

    // -------------------------------------------------------------------------
    // 2. getEligibleOrderIds
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getEligibleOrderIds - Success with valid authentication")
    void testGetEligibleOrderIds_Success() {
        when(reviewService.getEligibleOrderIdsForReview("user@duostyle.com", 10L)).thenReturn(List.of(50L));

        ResponseEntity<List<Long>> response = reviewController.getEligibleOrderIds(validAuth, 10L);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(50L, response.getBody().get(0));
    }

    @Test
    @DisplayName("getEligibleOrderIds - Throws 401 when authentication is null")
    void testGetEligibleOrderIds_Unauthenticated() {
        CustomException exception = assertThrows(CustomException.class, () ->
                reviewController.getEligibleOrderIds(null, 10L));

        assertEquals(401, exception.getStatus());
        assertTrue(exception.getMessage().contains("Vui lòng đăng nhập"));
    }

    // -------------------------------------------------------------------------
    // 3. createReview
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("createReview - Success creates new product review")
    void testCreateReview_Success() {
        ReviewRequest request = ReviewRequest.builder().productId(10L).rating(5).comment("Sản phẩm tuyệt vời").build();
        when(reviewService.createReview("user@duostyle.com", request)).thenReturn(sampleResponse);

        ResponseEntity<ReviewResponse> response = reviewController.createReview(validAuth, request);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5, response.getBody().getRating());
    }

    @Test
    @DisplayName("createReview - Throws 401 when unauthenticated")
    void testCreateReview_Unauthenticated() {
        ReviewRequest request = ReviewRequest.builder().productId(10L).rating(5).build();

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewController.createReview(null, request));

        assertEquals(401, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 4. updateReview
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateReview - Success updates existing review")
    void testUpdateReview_Success() {
        ReviewRequest request = ReviewRequest.builder().rating(4).comment("Đã cập nhật").build();
        when(reviewService.updateReview("user@duostyle.com", 500L, request)).thenReturn(sampleResponse);

        ResponseEntity<ReviewResponse> response = reviewController.updateReview(validAuth, 500L, request);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @DisplayName("updateReview - Throws 401 when unauthenticated")
    void testUpdateReview_Unauthenticated() {
        ReviewRequest request = ReviewRequest.builder().rating(4).build();

        CustomException exception = assertThrows(CustomException.class, () ->
                reviewController.updateReview(null, 500L, request));

        assertEquals(401, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 5. deleteReview
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("deleteReview - Success returns 204 No Content")
    void testDeleteReview_Success() {
        doNothing().when(reviewService).deleteReview("user@duostyle.com", 500L);

        ResponseEntity<Void> response = reviewController.deleteReview(validAuth, 500L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(reviewService, times(1)).deleteReview("user@duostyle.com", 500L);
    }

    @Test
    @DisplayName("deleteReview - Throws 401 when unauthenticated")
    void testDeleteReview_Unauthenticated() {
        CustomException exception = assertThrows(CustomException.class, () ->
                reviewController.deleteReview(null, 500L));

        assertEquals(401, exception.getStatus());
    }

    // -------------------------------------------------------------------------
    // 6. Admin Endpoints: getAllReviewsForAdmin, toggleReviewActive, replyToReview
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getAllReviewsForAdmin - Success returns paginated review page")
    void testGetAllReviewsForAdmin_Success() {
        PageResponse<ReviewResponse> pageResponse = PageResponse.<ReviewResponse>builder()
                .content(List.of(sampleResponse))
                .pageNo(0)
                .pageSize(20)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        when(reviewService.getAllReviewsForAdmin("Polo", 5, 0, 20)).thenReturn(pageResponse);

        ResponseEntity<PageResponse<ReviewResponse>> response = reviewController.getAllReviewsForAdmin("Polo", 5, 0, 20);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getContent().size());
    }

    @Test
    @DisplayName("toggleReviewActive - Success toggles review active status")
    void testToggleReviewActive_Success() {
        sampleResponse.setActive(false);
        when(reviewService.toggleReviewActive(500L)).thenReturn(sampleResponse);

        ResponseEntity<ReviewResponse> response = reviewController.toggleReviewActive(500L);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().getActive());
    }

    @Test
    @DisplayName("replyToReview - Success saves admin reply")
    void testReplyToReview_Success() {
        AdminReplyRequest request = AdminReplyRequest.builder().adminReply("Cảm ơn khách hàng!").build();
        sampleResponse.setAdminReply("Cảm ơn khách hàng!");
        when(reviewService.replyToReview(500L, request)).thenReturn(sampleResponse);

        ResponseEntity<ReviewResponse> response = reviewController.replyToReview(500L, request);

        assertNotNull(response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Cảm ơn khách hàng!", response.getBody().getAdminReply());
    }
}
