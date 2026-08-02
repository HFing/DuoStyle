package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.response.PaymentReturnResult;
import com.DuoStyle.DuoStyle.entity.Order;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    String createVnPayPaymentUrl(Order order, HttpServletRequest request);

    PaymentReturnResult processVnPayReturn(Map<String, String> params);
}
