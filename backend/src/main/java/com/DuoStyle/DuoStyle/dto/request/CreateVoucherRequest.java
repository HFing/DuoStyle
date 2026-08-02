package com.DuoStyle.DuoStyle.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVoucherRequest {
    private String code;
    private String title;
    private String description;
    private String discountType; // PERCENT or FIXED
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private String expiryDate; // e.g. "2026-12-31T23:59:59"
    @Builder.Default
    private Boolean active = true;
}
