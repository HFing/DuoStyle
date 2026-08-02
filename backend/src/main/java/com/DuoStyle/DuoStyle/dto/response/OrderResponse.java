package com.DuoStyle.DuoStyle.dto.response;

import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private BigDecimal subtotalAmount;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String phone;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String paymentUrl;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
