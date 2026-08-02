package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private String extractEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new CustomException(401, "Vui lòng đăng nhập để thực hiện thao tác này!");
        }
        return authentication.getName();
    }

    // Public Endpoint: Get reviews & summary for a product
    @GetMapping("/api/v1/products/{productId}/reviews")
    public ResponseEntity<ProductReviewSummaryResponse> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    // Authenticated Endpoint: Check eligibility for reviewing a product
    @GetMapping("/api/v1/reviews/eligibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Long>> getEligibleOrderIds(
            Authentication authentication,
            @RequestParam Long productId) {
        return ResponseEntity.ok(reviewService.getEligibleOrderIdsForReview(extractEmail(authentication), productId));
    }

    // Authenticated Endpoint: Create a review
    @PostMapping("/api/v1/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> createReview(
            Authentication authentication,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(extractEmail(authentication), request));
    }

    // Authenticated Endpoint: Update own review
    @PutMapping("/api/v1/reviews/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> updateReview(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(extractEmail(authentication), id, request));
    }

    // Authenticated Endpoint: Delete own review
    @DeleteMapping("/api/v1/reviews/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            Authentication authentication,
            @PathVariable Long id) {
        reviewService.deleteReview(extractEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    // Admin Endpoint: Get all reviews across system
    @GetMapping("/api/v1/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<ReviewResponse>> getAllReviewsForAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin(search, rating, page, size));
    }

    // Admin Endpoint: Toggle active visibility
    @PatchMapping("/api/v1/admin/reviews/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponse> toggleReviewActive(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.toggleReviewActive(id));
    }

    // Admin Endpoint: Reply to a review
    @PostMapping("/api/v1/admin/reviews/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewResponse> replyToReview(
            @PathVariable Long id,
            @RequestBody AdminReplyRequest request) {
        return ResponseEntity.ok(reviewService.replyToReview(id, request));
    }
}
