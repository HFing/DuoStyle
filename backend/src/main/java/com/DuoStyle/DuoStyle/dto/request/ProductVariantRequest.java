package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.ClothingSize;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private Long id;
    private ClothingSize size;
    private String color;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
}
