package com.DuoStyle.DuoStyle.service;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.MonthlySalesResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.TopProductResponse;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

public interface OrderService {
    OrderResponse createOrder(String userEmail, CreateOrderRequest request, HttpServletRequest servletRequest);
    PageResponse<OrderResponse> getUserOrders(String userEmail, int page, int size);
    OrderResponse getOrderByCode(String userEmail, String orderCode);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
    PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size);
    List<MonthlySalesResponse> getMonthlySalesAnalytics(Integer year);
    List<TopProductResponse> getTopSellingProducts(int limit);
}
