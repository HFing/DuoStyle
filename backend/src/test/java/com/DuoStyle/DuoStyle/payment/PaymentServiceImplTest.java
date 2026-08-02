package com.DuoStyle.DuoStyle.payment;

import com.DuoStyle.DuoStyle.config.VnPayConfig;
import com.DuoStyle.DuoStyle.dto.response.PaymentReturnResult;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.CartItem;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.entity.Payment;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.enums.PaymentStatus;
import com.DuoStyle.DuoStyle.repository.CartRepository;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.PaymentRepository;
import com.DuoStyle.DuoStyle.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    private static final String HASH_SECRET = "test-secret";

    @Mock
    private VnPayConfig vnPayConfig;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private CartRepository cartRepository;

    private PaymentServiceImpl service;
    private Order order;
    private Payment payment;
    private Cart cart;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        service = new PaymentServiceImpl(vnPayConfig, orderRepository, paymentRepository, cartRepository);

        User user = User.builder().id(7L).email("user@duostyle.local").password("encoded").build();
        variant = ProductVariant.builder().id(11L).stockQuantity(5).build();
        OrderItem item = OrderItem.builder().productVariant(variant).quantity(2).build();
        order = Order.builder()
                .id(91L)
                .orderCode("DS-RETURN")
                .user(user)
                .totalAmount(new BigDecimal("250000"))
                .paymentMethod(PaymentMethod.VNPAY)
                .checkoutSource(CheckoutSource.CART)
                .status(OrderStatus.PENDING)
                .items(List.of(item))
                .build();
        item.setOrder(order);
        payment = Payment.builder()
                .id(44L)
                .order(order)
                .paymentMethod(PaymentMethod.VNPAY)
                .amount(new BigDecimal("250000"))
                .status(PaymentStatus.PENDING)
                .build();
        cart = Cart.builder()
                .id(3L)
                .user(user)
                .items(new ArrayList<>(List.of(CartItem.builder().id(31L).quantity(1).build())))
                .build();
    }

    @Test
    void validSuccessfulReturnMarksPaymentSuccessProcessesOrderAndClearsCart() {
        stubStoredOrderAndPayment();
        when(cartRepository.findByUser_Email("user@duostyle.local")).thenReturn(Optional.of(cart));

        PaymentReturnResult result = service.processVnPayReturn(successParams());

        assertEquals("success", result.outcome());
        assertEquals("DS-RETURN", result.orderCode());
        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        assertEquals("VNP123", payment.getTransactionNo());
        assertNotNull(payment.getPaymentDate());
        assertEquals(OrderStatus.PROCESSING, order.getStatus());
        assertEquals(3, variant.getStockQuantity());
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void validSuccessfulBuyNowReturnDoesNotClearExistingCart() {
        order.setCheckoutSource(CheckoutSource.BUY_NOW);
        stubStoredOrderAndPayment();
        int originalCartSize = cart.getItems().size();

        PaymentReturnResult result = service.processVnPayReturn(successParams());

        assertEquals("success", result.outcome());
        assertEquals(3, variant.getStockQuantity());
        assertEquals(originalCartSize, cart.getItems().size());
        verify(cartRepository, never()).findByUser_Email("user@duostyle.local");
    }

    @Test
    void successfulReturnRejectsDuplicateLinesWhoseAggregatedQuantityExceedsVariantStock() {
        OrderItem duplicateLine = OrderItem.builder()
                .order(order)
                .productVariant(variant)
                .quantity(4)
                .build();
        order.setItems(List.of(order.getItems().getFirst(), duplicateLine));
        stubStoredOrderAndPayment();

        PaymentReturnResult result = service.processVnPayReturn(successParams());

        assertEquals("failed", result.outcome());
        assertEquals(5, variant.getStockQuantity());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        verify(cartRepository, never()).findByUser_Email("user@duostyle.local");
    }

    @Test
    void validCancellationMarksOrderCancelledWithoutChangingInventoryOrCart() {
        stubStoredOrderAndPayment();
        int originalCartSize = cart.getItems().size();

        PaymentReturnResult result = service.processVnPayReturn(cancellationParams());

        assertEquals("cancelled", result.outcome());
        assertEquals("DS-RETURN", result.orderCode());
        assertEquals(PaymentStatus.CANCELLED, payment.getStatus());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertEquals(5, variant.getStockQuantity());
        assertEquals(originalCartSize, cart.getItems().size());
        verify(cartRepository, never()).findByUser_Email("user@duostyle.local");
    }

    @Test
    void invalidSignatureNeverChangesStoredPaymentOrderInventoryOrCart() {
        Map<String, String> params = successParams();
        params.put("vnp_SecureHash", "invalid");

        PaymentReturnResult result = service.processVnPayReturn(params);

        assertEquals("failed", result.outcome());
        assertEquals("", result.orderCode());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(5, variant.getStockQuantity());
        assertFalse(cart.getItems().isEmpty());
        verifyNoInteractions(orderRepository, paymentRepository, cartRepository);
    }

    @Test
    void amountMismatchNeverChangesStoredPaymentOrderInventoryOrCart() {
        when(orderRepository.findById(91L)).thenReturn(Optional.of(order));

        PaymentReturnResult result = service.processVnPayReturn(amountMismatchParams());

        assertEquals("failed", result.outcome());
        assertEquals("DS-RETURN", result.orderCode());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(5, variant.getStockQuantity());
        assertFalse(cart.getItems().isEmpty());
    }

    @Test
    void malformedTransactionReferenceReturnsFailureWithoutRepositoryLookup() {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount", "25000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "not-a-local-reference");
        params.put("vnp_SecureHash", sign(params));

        PaymentReturnResult result = service.processVnPayReturn(params);

        assertEquals(new PaymentReturnResult("", "failed"), result);
        verifyNoInteractions(orderRepository, paymentRepository, cartRepository);
    }

    @Test
    void paymentUrlUsesPersistedOrderAmountAndProducesVerifiableSignature() {
        when(vnPayConfig.getTmnCode()).thenReturn("TESTTMN");
        when(vnPayConfig.getPayUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        when(vnPayConfig.getReturnUrl()).thenReturn("http://localhost:8080/api/v1/payments/vnpay-return");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.9");

        String paymentUrl = service.createVnPayPaymentUrl(order, request);
        Map<String, String> query = queryParams(paymentUrl);

        assertEquals("25000000", query.get("vnp_Amount"));
        assertTrue(query.get("vnp_TxnRef").matches("91_[0-9]+"));
        assertEquals("203.0.113.9", query.get("vnp_IpAddr"));
        String receivedHash = query.remove("vnp_SecureHash");
        assertEquals(sign(query), receivedHash);
    }

    private void stubStoredOrderAndPayment() {
        when(orderRepository.findById(91L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(91L)).thenReturn(Optional.of(payment));
    }

    private Map<String, String> successParams() {
        return params(
                "25000000",
                "00",
                "VNP123",
                "a7d41ffff16c1a83582ff42cb91a9a9735cd2d35b2552ea568efe54d38fe4ceb596f72942052274a144f59818d0140a31fc1ee7b7a6dc34461ed2898c3877ac6");
    }

    private Map<String, String> cancellationParams() {
        return params(
                "25000000",
                "24",
                "VNP124",
                "b7319c96acc02fe1ad0c78383ecdbe4a0465ad57bba69b047d945632e8ac81e5406844e02902db157d4848f7bfde74664d49725c89de2762506db1690a7bbd3f");
    }

    private Map<String, String> amountMismatchParams() {
        return params(
                "25010000",
                "00",
                "VNP125",
                "8757544f3c4a8b9ebb4f847977077c45cc7d733619d2821a03dd9fc4ed31faa8afa034a68ec63cf52e62fd9a90a34a7255e0bc6b41d0a171c943b3ee41baf9ac");
    }

    private Map<String, String> params(String amount, String responseCode, String transactionNo, String hash) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Amount", amount);
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TransactionNo", transactionNo);
        params.put("vnp_TxnRef", "91_1710000000000");
        params.put("vnp_SecureHash", hash);
        return params;
    }

    private String sign(Map<String, String> params) {
        try {
            String canonical = params.entrySet().stream()
                    .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                    .filter(entry -> !"vnp_SecureHashType".equals(entry.getKey()))
                    .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII)
                            + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                    .collect(Collectors.joining("&"));
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(HASH_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return java.util.HexFormat.of().formatHex(mac.doFinal(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private Map<String, String> queryParams(String url) {
        return Arrays.stream(URI.create(url).getRawQuery().split("&"))
                .map(part -> part.split("=", 2))
                .collect(Collectors.toMap(
                        part -> URLDecoder.decode(part[0], StandardCharsets.UTF_8),
                        part -> URLDecoder.decode(part[1], StandardCharsets.UTF_8),
                        (left, right) -> right,
                        LinkedHashMap::new));
    }
}
