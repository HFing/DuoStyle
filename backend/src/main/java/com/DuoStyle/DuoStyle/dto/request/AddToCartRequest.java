package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long productVariantId;
    private Integer quantity;
}
