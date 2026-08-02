package com.DuoStyle.DuoStyle.order;

import com.DuoStyle.DuoStyle.controller.OrderController;
import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.ApiResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private Authentication validAuth;
    private OrderResponse sampleOrderResponse;

    @BeforeEach
    void setUp() {
        validAuth = new UsernamePasswordAuthenticationToken("user@duostyle.local", "password", Collections.emptyList());
        sampleOrderResponse = OrderResponse.builder().id(100L).orderCode("DS-999").build();
    }

    @Test
    @DisplayName("createOrder - Success creates order")
    void testCreateOrder_Success() {
        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        CreateOrderRequest request = new CreateOrderRequest();
        when(orderService.createOrder("user@duostyle.local", request, servletRequest)).thenReturn(sampleOrderResponse);

        ResponseEntity<ApiResponse<OrderResponse>> response = orderController.createOrder(validAuth, request, servletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DS-999", response.getBody().getData().getOrderCode());
    }

    @Test
    @DisplayName("getMyOrders - Retrieves user order history")
    void testGetMyOrders_Success() {
        PageResponse<OrderResponse> pageResponse = PageResponse.<OrderResponse>builder().content(List.of(sampleOrderResponse)).build();
        when(orderService.getUserOrders("user@duostyle.local", 0, 10)).thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> response = orderController.getMyOrders(validAuth, 0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().getContent().size());
    }

    @Test
    @DisplayName("getOrderByCode - Retrieves order by code")
    void testGetOrderByCode_Success() {
        when(orderService.getOrderByCode("user@duostyle.local", "DS-999")).thenReturn(sampleOrderResponse);

        ResponseEntity<ApiResponse<OrderResponse>> response = orderController.getOrderByCode(validAuth, "DS-999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DS-999", response.getBody().getData().getOrderCode());
    }

    @Test
    void createOrderRejectsMissingAuthenticationAtTheControllerBoundary() {
        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        CustomException exception = assertThrows(CustomException.class,
                () -> orderController.createOrder(null, new CreateOrderRequest(), servletRequest));

        assertEquals(401, exception.getStatus());
        verify(orderService, never()).createOrder(any(), any(), any());
    }

    @Test
    void createOrderRejectsBlankAuthenticatedSubjectAtTheControllerBoundary() {
        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        Authentication blankAuth = mock(Authentication.class);
        when(blankAuth.getName()).thenReturn("   ");

        CustomException exception = assertThrows(CustomException.class,
                () -> orderController.createOrder(blankAuth, new CreateOrderRequest(), servletRequest));

        assertEquals(401, exception.getStatus());
    }

    @Test
    void createOrderRejectsNullRequestBodyAtTheControllerBoundary() {
        HttpServletRequest servletRequest = mock(HttpServletRequest.class);
        CustomException exception = assertThrows(CustomException.class,
                () -> orderController.createOrder(validAuth, null, servletRequest));

        assertEquals(400, exception.getStatus());
        verify(orderService, never()).createOrder(any(), any(), any());
    }
}
