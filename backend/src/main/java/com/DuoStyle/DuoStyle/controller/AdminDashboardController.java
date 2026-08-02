package com.DuoStyle.DuoStyle.controller;

import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStats(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        DashboardResponse stats = adminDashboardService.getFilteredStats(status, paymentMethod, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats, "Filtered dashboard statistics retrieved successfully using JPA Specifications"));
    }
}
