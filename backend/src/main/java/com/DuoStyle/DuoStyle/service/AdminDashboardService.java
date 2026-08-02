package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;

import java.time.LocalDateTime;

public interface AdminDashboardService {
    DashboardResponse getDashboardStats();
    DashboardResponse getFilteredStats(OrderStatus status, PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate);
}
