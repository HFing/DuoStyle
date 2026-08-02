package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @RequestBody CreateOrderRequest request,
            HttpServletRequest servletRequest
    ) {
        String email = requireAuthenticatedEmail(authentication);
        if (request == null) {
            throw new CustomException(400, "Order request is required");
        }
        OrderResponse response = orderService.createOrder(email, request, servletRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Order created successfully"));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<OrderResponse> orders = orderService.getUserOrders(
                requireAuthenticatedEmail(authentication), page, size);
        return ResponseEntity.ok(ApiResponse.success(orders, "Order history retrieved successfully"));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        OrderResponse order = orderService.getOrderByCode(
                requireAuthenticatedEmail(authentication), orderCode);
        return ResponseEntity.ok(ApiResponse.success(order, "Order status & details retrieved successfully"));
    }

    private String requireAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new CustomException(401, "Authentication required");
        }
        return authentication.getName();
    }
}
