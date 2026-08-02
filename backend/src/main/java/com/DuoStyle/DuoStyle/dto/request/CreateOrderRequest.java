package com.DuoStyle.DuoStyle.dto.request;

import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String shippingAddress;
    private String phone;
    private PaymentMethod paymentMethod;
    private CheckoutSource checkoutSource;
    private List<OrderItemRequest> items;
    private String voucherCode;
}
