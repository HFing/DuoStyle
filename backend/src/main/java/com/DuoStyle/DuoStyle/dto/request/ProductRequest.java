package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private GenderTarget genderTarget;
    private Long categoryId;
    private List<String> images;
    private List<ProductVariantRequest> variants;
}
