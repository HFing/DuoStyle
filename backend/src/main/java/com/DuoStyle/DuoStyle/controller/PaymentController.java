package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.PaymentReturnResult;
import com.DuoStyle.DuoStyle.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final String frontendUrl;

    public PaymentController(
            PaymentService paymentService,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.paymentService = paymentService;
        this.frontendUrl = frontendUrl;
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        PaymentReturnResult result = paymentService.processVnPayReturn(params);
        URI redirect = UriComponentsBuilder.fromUriString(stripTrailingSlash(frontendUrl))
                .path("/")
                .queryParam("page", "payment-result")
                .queryParam("outcome", result.outcome())
                .queryParam("orderCode", result.orderCode())
                .build()
                .encode()
                .toUri();
        return ResponseEntity.status(302).location(redirect).build();
    }

    private String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
