package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductVariantResponse {
    private Long id;
    private ClothingSize size;
    private String color;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
}
