package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ProductReviewSummaryResponse getProductReviews(Long productId);

    List<Long> getEligibleOrderIdsForReview(String userEmail, Long productId);

    ReviewResponse createReview(String userEmail, ReviewRequest request);

    ReviewResponse updateReview(String userEmail, Long reviewId, ReviewRequest request);

    void deleteReview(String userEmail, Long reviewId);

    PageResponse<ReviewResponse> getAllReviewsForAdmin(String search, Integer rating, int page, int size);

    ReviewResponse toggleReviewActive(Long reviewId);

    ReviewResponse replyToReview(Long reviewId, AdminReplyRequest request);
}
