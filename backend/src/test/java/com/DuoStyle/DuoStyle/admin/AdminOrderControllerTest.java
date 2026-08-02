package com.DuoStyle.DuoStyle.admin;

import com.DuoStyle.DuoStyle.controller.AdminOrderController;
import com.DuoStyle.DuoStyle.dto.response.*;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminOrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private AdminOrderController adminOrderController;

    private OrderResponse sampleOrderResponse;

    @BeforeEach
    void setUp() {
        sampleOrderResponse = OrderResponse.builder().id(50L).orderCode("DS-100").status(OrderStatus.DELIVERED).build();
    }

    @Test
    @DisplayName("getAllOrders - Admin fetches all orders")
    void testGetAllOrders_Success() {
        PageResponse<OrderResponse> pageResponse = PageResponse.<OrderResponse>builder().content(List.of(sampleOrderResponse)).build();
        when(orderService.getAllOrders(OrderStatus.DELIVERED, 0, 20)).thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> response = adminOrderController.getAllOrders(OrderStatus.DELIVERED, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getData().getContent().size());
    }

    @Test
    @DisplayName("getMonthlyAnalytics - Fetches monthly sales analytics")
    void testGetMonthlyAnalytics_Success() {
        MonthlySalesResponse monthly = MonthlySalesResponse.builder().month(8).orderCount(10L).revenue(new BigDecimal("1000000")).build();
        when(orderService.getMonthlySalesAnalytics(2026)).thenReturn(List.of(monthly));

        ResponseEntity<ApiResponse<List<MonthlySalesResponse>>> response = adminOrderController.getMonthlyAnalytics(2026);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("getTopSellingProducts - Fetches top products")
    void testGetTopSellingProducts_Success() {
        TopProductResponse topProduct = TopProductResponse.builder().productId(10L).productName("Polo").totalQuantitySold(50L).build();
        when(orderService.getTopSellingProducts(5)).thenReturn(List.of(topProduct));

        ResponseEntity<ApiResponse<List<TopProductResponse>>> response = adminOrderController.getTopSellingProducts(5);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    @DisplayName("updateOrderStatus - Admin updates order status")
    void testUpdateOrderStatus_Success() {
        when(orderService.updateOrderStatus(50L, OrderStatus.DELIVERED)).thenReturn(sampleOrderResponse);

        ResponseEntity<ApiResponse<OrderResponse>> response = adminOrderController.updateOrderStatus(50L, OrderStatus.DELIVERED);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(OrderStatus.DELIVERED, response.getBody().getData().getStatus());
    }
}
