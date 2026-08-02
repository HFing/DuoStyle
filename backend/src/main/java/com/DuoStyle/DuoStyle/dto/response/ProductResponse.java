package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.GenderTarget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private GenderTarget genderTarget;
    private Long categoryId;
    private String categoryName;
    private List<String> images; // List of images (1 main thumbnail + sub images)
    private List<ProductVariantResponse> variants;
    private Double averageRating;
    private Integer reviewCount;
}
