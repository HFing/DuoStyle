package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnailUrl;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long orderId;
    private String orderCode;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private String adminReply;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
