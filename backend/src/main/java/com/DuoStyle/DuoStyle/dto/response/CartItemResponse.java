package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productVariantId;
    private String productName;
    private ClothingSize size;
    private String color;
    private String thumbnailUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal itemTotal;
}
