package com.DuoStyle.DuoStyle.order;

import com.DuoStyle.DuoStyle.dto.response.MonthlySalesResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.TopProductResponse;
import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsOrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order order1;
    private Order order2;
    private Product product1;

    @BeforeEach
    void setUp() {
        Category cat = Category.builder().id(1L).name("Áo Măng Tô").build();
        product1 = Product.builder().id(101L).name("Áo Măng Tô Cashmere").category(cat).thumbnailUrl("https://img.com/1.jpg").build();
        ProductVariant variant1 = ProductVariant.builder().id(1001L).product(product1).price(new BigDecimal("2000000")).build();

        OrderItem item1 = OrderItem.builder().id(1L).productVariant(variant1).price(new BigDecimal("2000000")).quantity(2).build();

        order1 = Order.builder()
                .id(1L)
                .orderCode("DS-ORDER-01")
                .totalAmount(new BigDecimal("4000000"))
                .status(OrderStatus.DELIVERED)
                .createdAt(LocalDateTime.of(2026, 8, 1, 10, 0))
                .items(List.of(item1))
                .build();

        order2 = Order.builder()
                .id(2L)
                .orderCode("DS-ORDER-02")
                .totalAmount(new BigDecimal("2000000"))
                .status(OrderStatus.PROCESSING)
                .createdAt(LocalDateTime.of(2026, 8, 5, 14, 0))
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getMonthlySalesAnalytics - Aggregates 12 months for year 2026")
    void testGetMonthlySalesAnalytics_Success() {
        when(orderRepository.findAll()).thenReturn(List.of(order1, order2));

        List<MonthlySalesResponse> analytics = orderService.getMonthlySalesAnalytics(2026);

        assertNotNull(analytics);
        assertEquals(12, analytics.size());
        assertEquals("AUG", analytics.get(7).getMonthName());
        assertEquals(new BigDecimal("6000000"), analytics.get(7).getRevenue());
        assertEquals(2, analytics.get(7).getOrderCount());
    }

    @Test
    @DisplayName("getTopSellingProducts - Return sorted list of top selling products")
    void testGetTopSellingProducts_Success() {
        when(orderRepository.findAll()).thenReturn(List.of(order1, order2));

        List<TopProductResponse> topProducts = orderService.getTopSellingProducts(5);

        assertNotNull(topProducts);
        assertEquals(1, topProducts.size());
        assertEquals(101L, topProducts.get(0).getProductId());
        assertEquals("Áo Măng Tô Cashmere", topProducts.get(0).getProductName());
        assertEquals(2L, topProducts.get(0).getTotalQuantitySold());
        assertEquals(new BigDecimal("4000000"), topProducts.get(0).getTotalRevenue());
    }

    @Test
    @DisplayName("getAllOrders - Return paged order list by status filter")
    void testGetAllOrders_FilteredByStatus() {
        Page<Order> page = new PageImpl<>(List.of(order1), PageRequest.of(0, 10), 1);
        when(orderRepository.findByStatus(eq(OrderStatus.DELIVERED), any(Pageable.class))).thenReturn(page);

        PageResponse<OrderResponse> response = orderService.getAllOrders(OrderStatus.DELIVERED, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("DS-ORDER-01", response.getContent().get(0).getOrderCode());
    }
}
