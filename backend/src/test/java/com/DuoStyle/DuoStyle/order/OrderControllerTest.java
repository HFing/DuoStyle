package com.DuoStyle.DuoStyle.order;

import com.DuoStyle.DuoStyle.controller.OrderController;
import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService orderService;
    @Mock
    private Authentication authentication;
    @Mock
    private HttpServletRequest servletRequest;

    @Test
    void createOrderRejectsMissingAuthenticationAtTheControllerBoundary() {
        OrderController controller = new OrderController(orderService);

        CustomException exception = assertThrows(CustomException.class,
                () -> controller.createOrder(null, new CreateOrderRequest(), servletRequest));

        assertEquals(401, exception.getStatus());
        verify(orderService, never()).createOrder(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void createOrderRejectsBlankAuthenticatedSubjectAtTheControllerBoundary() {
        OrderController controller = new OrderController(orderService);
        when(authentication.getName()).thenReturn("   ");

        CustomException exception = assertThrows(CustomException.class,
                () -> controller.createOrder(authentication, new CreateOrderRequest(), servletRequest));

        assertEquals(401, exception.getStatus());
    }

    @Test
    void createOrderRejectsNullRequestBodyAtTheControllerBoundary() {
        OrderController controller = new OrderController(orderService);
        when(authentication.getName()).thenReturn("user@duostyle.local");

        CustomException exception = assertThrows(CustomException.class,
                () -> controller.createOrder(authentication, null, servletRequest));

        assertEquals(400, exception.getStatus());
        verify(orderService, never()).createOrder(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
