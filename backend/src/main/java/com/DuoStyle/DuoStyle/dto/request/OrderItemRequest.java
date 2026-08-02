package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productVariantId;
    private Integer quantity;
}
