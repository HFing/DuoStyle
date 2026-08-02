package com.DuoStyle.DuoStyle.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ApplyVoucherRequest {
    private String code;
    private BigDecimal orderAmount;
}
