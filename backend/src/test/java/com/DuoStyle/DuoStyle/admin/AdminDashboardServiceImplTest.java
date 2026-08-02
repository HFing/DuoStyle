package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.dto.response.DashboardResponse;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.ProductRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.impl.AdminDashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminDashboardServiceImpl adminDashboardService;

    private Order order1;
    private Order order2;
    private Order orderCancelled;

    @BeforeEach
    void setUp() {
        order1 = Order.builder()
                .id(1L)
                .status(OrderStatus.DELIVERED)
                .totalAmount(BigDecimal.valueOf(500000))
                .build();

        order2 = Order.builder()
                .id(2L)
                .status(OrderStatus.DELIVERED)
                .totalAmount(BigDecimal.valueOf(300000))
                .build();

        orderCancelled = Order.builder()
                .id(3L)
                .status(OrderStatus.CANCELLED)
                .totalAmount(BigDecimal.valueOf(100000))
                .build();
    }

    @Test
    @DisplayName("getDashboardStats - Calculate total revenue and stats without filters")
    void testGetDashboardStats_Success() {
        when(orderRepository.findAll(any(Specification.class))).thenReturn(List.of(order1, order2, orderCancelled));
        when(productRepository.count()).thenReturn(50L);
        when(userRepository.countByRoles_Name("ROLE_CUSTOMER")).thenReturn(20L);

        DashboardResponse response = adminDashboardService.getDashboardStats();

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(800000), response.getTotalRevenue());
        assertEquals(3L, response.getTotalOrders());
        assertEquals(50L, response.getTotalProducts());
        assertEquals(20L, response.getTotalCustomers());
    }

    @Test
    @DisplayName("getFilteredStats - Filter stats by date range, status and payment method")
    void testGetFilteredStats_Success() {
        when(orderRepository.findAll(any(Specification.class))).thenReturn(List.of(order1));
        when(productRepository.count()).thenReturn(50L);
        when(userRepository.countByRoles_Name("ROLE_CUSTOMER")).thenReturn(20L);

        LocalDateTime now = LocalDateTime.now();
        DashboardResponse response = adminDashboardService.getFilteredStats(
                OrderStatus.DELIVERED, PaymentMethod.VNPAY, now.minusDays(7), now);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(500000), response.getTotalRevenue());
        assertEquals(1L, response.getTotalOrders());
    }
}
