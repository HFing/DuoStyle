package com.DuoStyle.DuoStyle.common;

import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.service.impl.EmailServiceImpl;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailServiceImpl emailService;

    private Order order;

    @BeforeEach
    void setUp() {
        OrderItem item = OrderItem.builder()
                .productName("Áo Khoác Nam")
                .size("XL")
                .color("Đen")
                .quantity(1)
                .price(BigDecimal.valueOf(450000))
                .build();

        order = Order.builder()
                .orderCode("DS-123456")
                .phone("0987654321")
                .shippingAddress("123 Phố Huế, Hà Nội")
                .paymentMethod(PaymentMethod.COD)
                .items(List.of(item))
                .totalAmount(BigDecimal.valueOf(450000))
                .build();
    }

    @Test
    @DisplayName("sendOrderConfirmationEmail - Send email without throwing exception when mailSender creates message")
    void testSendOrderConfirmationEmail_Success() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        assertDoesNotThrow(() -> emailService.sendOrderConfirmationEmail("customer@example.com", order));

        verify(mailSender, times(1)).send(mimeMessage);
    }

    @Test
    @DisplayName("sendOrderConfirmationEmail - Gracefully handle exception without crashing application")
    void testSendOrderConfirmationEmail_ExceptionHandling() {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Mail server down"));

        assertDoesNotThrow(() -> emailService.sendOrderConfirmationEmail("customer@example.com", order));
    }
}
