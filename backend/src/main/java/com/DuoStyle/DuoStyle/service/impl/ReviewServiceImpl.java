package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.AdminReplyRequest;
import com.DuoStyle.DuoStyle.dto.request.ReviewRequest;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.ProductReviewSummaryResponse;
import com.DuoStyle.DuoStyle.dto.response.ReviewResponse;
import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.*;
import com.DuoStyle.DuoStyle.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(404, "Product not found"));

        List<ProductReview> reviews = reviewRepository.findByProductIdAndActiveTrueOrderByCreatedAtDesc(productId);

        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);
        double roundedAvg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0;

        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0);
        }
        for (ProductReview r : reviews) {
            int star = Math.max(1, Math.min(5, r.getRating()));
            distribution.put(star, distribution.get(star) + 1);
        }

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ProductReviewSummaryResponse.builder()
                .productId(product.getId())
                .averageRating(roundedAvg)
                .totalReviews(reviews.size())
                .ratingDistribution(distribution)
                .reviews(reviewResponses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getEligibleOrderIdsForReview(String userEmail, Long productId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        List<Order> userOrders = orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);

        List<Long> eligibleOrderIds = new ArrayList<>();
        for (Order order : userOrders) {
            if (order.getStatus() == OrderStatus.DELIVERED) {
                boolean containsProduct = order.getItems() != null && order.getItems().stream()
                        .anyMatch(item -> item.getProductVariant() != null
                                && item.getProductVariant().getProduct() != null
                                && item.getProductVariant().getProduct().getId().equals(productId));
                if (containsProduct) {
                    boolean alreadyReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(
                            user.getId(), productId, order.getId());
                    if (!alreadyReviewed) {
                        eligibleOrderIds.add(order.getId());
                    }
                }
            }
        }
        return eligibleOrderIds;
    }

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, ReviewRequest request) {
        if (request.getProductId() == null) {
            throw new CustomException(400, "Product ID is required");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new CustomException(400, "Rating must be between 1 and 5 stars");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new CustomException(404, "Product not found"));

        Order verifiedOrder = null;
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new CustomException(404, "Order not found"));

            if (!order.getUser().getId().equals(user.getId())) {
                throw new CustomException(403, "Order does not belong to user");
            }
            if (order.getStatus() != OrderStatus.DELIVERED) {
                throw new CustomException(400, "Bạn chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao thành công (DELIVERED)");
            }
            boolean itemFound = order.getItems() != null && order.getItems().stream()
                    .anyMatch(i -> i.getProductVariant() != null
                            && i.getProductVariant().getProduct() != null
                            && i.getProductVariant().getProduct().getId().equals(product.getId()));
            if (!itemFound) {
                throw new CustomException(400, "Sản phẩm không có trong đơn hàng chỉ định");
            }
            verifiedOrder = order;
        } else {
            List<Long> eligibleOrderIds = getEligibleOrderIdsForReview(userEmail, product.getId());
            if (eligibleOrderIds.isEmpty()) {
                throw new CustomException(400, "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng (Đơn hàng giao thành công - DELIVERED)");
            }
            verifiedOrder = orderRepository.findById(eligibleOrderIds.get(0)).orElse(null);
        }

        if (verifiedOrder != null) {
            boolean alreadyReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(
                    user.getId(), product.getId(), verifiedOrder.getId());
            if (alreadyReviewed) {
                throw new CustomException(400, "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi!");
            }
        }

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .order(verifiedOrder)
                .rating(request.getRating())
                .comment(request.getComment())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();

        ProductReview saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(String userEmail, Long reviewId, ReviewRequest request) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(404, "Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new CustomException(403, "You can only update your own review");
        }

        if (request.getRating() != null && (request.getRating() < 1 || request.getRating() > 5)) {
            throw new CustomException(400, "Rating must be between 1 and 5 stars");
        }

        if (request.getRating() != null) review.setRating(request.getRating());
        if (request.getComment() != null) review.setComment(request.getComment());
        if (request.getImageUrl() != null) review.setImageUrl(request.getImageUrl());

        ProductReview updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteReview(String userEmail, Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(404, "Review not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException(404, "User not found"));

        boolean isAdmin = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r.getName()) || "ADMIN".equalsIgnoreCase(r.getName()));

        if (!review.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new CustomException(403, "You can only delete your own review");
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllReviewsForAdmin(String search, Integer rating, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Integer validRating = (rating != null && rating >= 1 && rating <= 5) ? rating : null;

        Page<ProductReview> pageResult = reviewRepository.findAllForAdminSearch(cleanSearch, validRating, pageable);

        List<ReviewResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .pageNo(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse toggleReviewActive(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(404, "Review not found"));

        review.setActive(!Boolean.TRUE.equals(review.getActive()));
        ProductReview updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ReviewResponse replyToReview(Long reviewId, AdminReplyRequest request) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(404, "Review not found"));

        review.setAdminReply(request.getAdminReply());
        ProductReview updated = reviewRepository.save(review);
        return mapToResponse(updated);
    }

    private ReviewResponse mapToResponse(ProductReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .productThumbnailUrl(review.getProduct() != null ? review.getProduct().getThumbnailUrl() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : null)
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .orderId(review.getOrder() != null ? review.getOrder().getId() : null)
                .orderCode(review.getOrder() != null ? review.getOrder().getOrderCode() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .adminReply(review.getAdminReply())
                .active(review.getActive())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
