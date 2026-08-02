package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewSummaryResponse {
    private Long productId;
    private Double averageRating;
    private Integer totalReviews;
    private Map<Integer, Integer> ratingDistribution; // 1 -> count, 2 -> count, ... 5 -> count
    private List<ReviewResponse> reviews;
}
