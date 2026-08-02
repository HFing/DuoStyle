package com.DuoStyle.DuoStyle.order;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CheckoutContractTest {

    @Test
    void createOrderRequestCarriesCheckoutSource() {
        CreateOrderRequest request = new CreateOrderRequest();

        request.setCheckoutSource(CheckoutSource.CART);

        assertEquals(CheckoutSource.CART, request.getCheckoutSource());
    }
}
