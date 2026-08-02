package com.DuoStyle.DuoStyle.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductResponse {
    private Long productId;
    private String productName;
    private String thumbnailUrl;
    private String categoryName;
    private long totalQuantitySold;
    private BigDecimal totalRevenue;
}
