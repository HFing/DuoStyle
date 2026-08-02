package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.MonthlySalesResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.TopProductResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response, "Admin orders list retrieved successfully"));
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<ApiResponse<List<MonthlySalesResponse>>> getMonthlyAnalytics(
            @RequestParam(required = false) Integer year
    ) {
        List<MonthlySalesResponse> analytics = orderService.getMonthlySalesAnalytics(year);
        return ResponseEntity.ok(ApiResponse.success(analytics, "Monthly sales analytics retrieved successfully"));
    }

    @GetMapping("/analytics/top-products")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<TopProductResponse> topProducts = orderService.getTopSellingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(topProducts, "Top selling products retrieved successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated successfully"));
    }
}
