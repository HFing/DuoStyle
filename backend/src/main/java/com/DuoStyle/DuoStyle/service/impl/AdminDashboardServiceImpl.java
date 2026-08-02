package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.AdminDashboardService;
import com.DuoStyle.DuoStyle.specification.OrderSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        return getFilteredStats(null, null, null, null);
    }

    @Override
    public DashboardResponse getFilteredStats(OrderStatus status, PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Order> spec = Specification.where(OrderSpecification.hasStatus(status))
                .and(OrderSpecification.hasPaymentMethod(paymentMethod))
                .and(OrderSpecification.createdBetween(startDate, endDate));

        List<Order> filteredOrders = orderRepository.findAll(spec);

        BigDecimal totalRevenue = filteredOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = filteredOrders.size();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.countByRoles_Name("ROLE_CUSTOMER");

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .build();
    }
}
