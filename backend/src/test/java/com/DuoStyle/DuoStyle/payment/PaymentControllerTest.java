package com.DuoStyle.DuoStyle.payment;

import com.DuoStyle.DuoStyle.controller.PaymentController;
import com.DuoStyle.DuoStyle.dto.response.PaymentReturnResult;
import com.DuoStyle.DuoStyle.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.net.URI;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Test
    void vnpayReturnRedirectsEveryOutcomeToTheReactPaymentResultPage() {
        PaymentController controller = new PaymentController(paymentService, "http://localhost:5173");
        Map<String, String> params = Map.of("vnp_TxnRef", "91_1710000000000");

        assertRedirect(controller, params, "success");
        assertRedirect(controller, params, "cancelled");
        assertRedirect(controller, params, "failed");
    }

    private void assertRedirect(
            PaymentController controller,
            Map<String, String> params,
            String outcome
    ) {
        when(paymentService.processVnPayReturn(params))
                .thenReturn(new PaymentReturnResult("DS-123", outcome));

        ResponseEntity<Void> response = controller.vnpayReturn(params);

        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertEquals(
                URI.create("http://localhost:5173/?page=payment-result&outcome=" + outcome + "&orderCode=DS-123"),
                response.getHeaders().getLocation());
    }
}
