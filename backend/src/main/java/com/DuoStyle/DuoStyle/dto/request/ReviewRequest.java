package com.DuoStyle.DuoStyle.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {
    private Long productId;
    private Long orderId;
    private Integer rating; // 1 to 5
    private String comment;
    private String imageUrl;
}
