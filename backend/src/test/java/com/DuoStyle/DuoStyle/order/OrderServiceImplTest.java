package com.DuoStyle.DuoStyle.order;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.request.OrderItemRequest;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.VoucherCalculation;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.CartItem;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.Payment;
import com.DuoStyle.DuoStyle.entity.Product;
import com.DuoStyle.DuoStyle.entity.ProductVariant;
import com.DuoStyle.DuoStyle.entity.User;
import com.DuoStyle.DuoStyle.enums.CheckoutSource;
import com.DuoStyle.DuoStyle.enums.OrderStatus;
import com.DuoStyle.DuoStyle.enums.PaymentMethod;
import com.DuoStyle.DuoStyle.enums.PaymentStatus;
import com.DuoStyle.DuoStyle.exception.CustomException;
import com.DuoStyle.DuoStyle.repository.CartRepository;
import com.DuoStyle.DuoStyle.repository.OrderRepository;
import com.DuoStyle.DuoStyle.repository.PaymentRepository;
import com.DuoStyle.DuoStyle.repository.UserRepository;
import com.DuoStyle.DuoStyle.service.EmailService;
import com.DuoStyle.DuoStyle.service.PaymentService;
import com.DuoStyle.DuoStyle.service.VoucherService;
import com.DuoStyle.DuoStyle.service.impl.OrderServiceImpl;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private PaymentService paymentService;
    @Mock
    private VoucherService voucherService;
    @Mock
    private EmailService emailService;
    @Mock
    private EntityManager entityManager;
    @Mock
    private HttpServletRequest servletRequest;

    @InjectMocks
    private OrderServiceImpl service;

    private User user;
    private Cart cart;
    private ProductVariant firstVariant;
    private ProductVariant secondVariant;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(7L)
                .email("user@duostyle.local")
                .password("encoded")
                .phone("old-phone")
                .address("old-address")
                .build();

        Product firstProduct = Product.builder().id(101L).name("Duo Shirt").slug("duo-shirt").build();
        firstVariant = ProductVariant.builder()
                .id(11L)
                .product(firstProduct)
                .price(new BigDecimal("250000"))
                .stockQuantity(5)
                .color("Black")
                .build();

        Product secondProduct = Product.builder().id(202L).name("Duo Pants").slug("duo-pants").build();
        secondVariant = ProductVariant.builder()
                .id(22L)
                .product(secondProduct)
                .price(new BigDecimal("250000"))
                .stockQuantity(4)
                .color("Blue")
                .build();

        cart = Cart.builder()
                .id(3L)
                .user(user)
                .items(new ArrayList<>(List.of(
                        CartItem.builder().id(31L).productVariant(firstVariant).quantity(2).build())))
                .build();

    }

    @Test
    void codCartOrderUsesDatabasePricesSavesProfileDecrementsStockAndClearsCart() {
        stubSuccessfulCheckout();
        when(entityManager.find(ProductVariant.class, 22L)).thenReturn(secondVariant);
        when(cartRepository.findByUser_Email("user@duostyle.local")).thenReturn(Optional.of(cart));
        CreateOrderRequest request = request(
                CheckoutSource.CART,
                PaymentMethod.COD,
                item(11L, 2),
                item(22L, 1));

        OrderResponse result = service.createOrder("user@duostyle.local", request, servletRequest);

        assertEquals(new BigDecimal("750000"), result.getTotalAmount());
        assertEquals(new BigDecimal("750000"), result.getSubtotalAmount());
        assertEquals(BigDecimal.ZERO, result.getDiscountAmount());
        assertNull(result.getVoucherCode());
        assertEquals(OrderStatus.PROCESSING, result.getStatus());
        assertEquals("0901234567", user.getPhone());
        assertEquals("1 Nguyen Hue", user.getAddress());
        assertEquals("0901234567", result.getPhone());
        assertEquals("1 Nguyen Hue", result.getShippingAddress());
        assertTrue(cart.getItems().isEmpty());
        assertEquals(3, firstVariant.getStockQuantity());
        assertEquals(3, secondVariant.getStockQuantity());

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        Payment payment = paymentCaptor.getValue();
        assertEquals(PaymentMethod.COD, payment.getPaymentMethod());
        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        assertEquals(new BigDecimal("750000"), payment.getAmount());
        assertEquals(91L, payment.getOrder().getId());
        verify(voucherService, never()).calculateVoucher(any(), any());
    }

    @Test
    void voucherOrderUsesDatabaseSubtotalAndPersistsAuthoritativeSnapshot() {
        stubSuccessfulCheckout();
        firstVariant.setPrice(new BigDecimal("2000000"));
        CreateOrderRequest request = request(
                CheckoutSource.BUY_NOW,
                PaymentMethod.COD,
                item(11L, 2));
        request.setVoucherCode("VIP20");
        when(voucherService.calculateVoucher("VIP20", new BigDecimal("4000000")))
                .thenReturn(new VoucherCalculation("VIP20", new BigDecimal("500000")));

        OrderResponse result = service.createOrder("user@duostyle.local", request, servletRequest);

        assertEquals(new BigDecimal("4000000"), result.getSubtotalAmount());
        assertEquals("VIP20", result.getVoucherCode());
        assertEquals(new BigDecimal("500000"), result.getDiscountAmount());
        assertEquals(new BigDecimal("3500000"), result.getTotalAmount());

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();
        assertEquals(new BigDecimal("4000000"), savedOrder.getSubtotalAmount());
        assertEquals("VIP20", savedOrder.getVoucherCode());
        assertEquals(new BigDecimal("500000"), savedOrder.getDiscountAmount());
        assertEquals(new BigDecimal("3500000"), savedOrder.getTotalAmount());

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertEquals(new BigDecimal("3500000"), paymentCaptor.getValue().getAmount());
        verify(voucherService).calculateVoucher("VIP20", new BigDecimal("4000000"));
    }

    @Test
    void blankVoucherCodeProducesNoVoucherSnapshotWithoutCallingCalculator() {
        stubSuccessfulCheckout();
        CreateOrderRequest request = request(
                CheckoutSource.BUY_NOW,
                PaymentMethod.COD,
                item(11L, 1));
        request.setVoucherCode("   ");

        OrderResponse result = service.createOrder("user@duostyle.local", request, servletRequest);

        assertEquals(new BigDecimal("250000"), result.getSubtotalAmount());
        assertNull(result.getVoucherCode());
        assertEquals(BigDecimal.ZERO, result.getDiscountAmount());
        assertEquals(new BigDecimal("250000"), result.getTotalAmount());
        verify(voucherService, never()).calculateVoucher(any(), any());
    }

    @Test
    void vnpayReceivesDiscountedOrderTotal() {
        stubSuccessfulCheckout();
        CreateOrderRequest request = request(
                CheckoutSource.BUY_NOW,
                PaymentMethod.VNPAY,
                item(11L, 2));
        request.setVoucherCode("SAVE100");
        when(voucherService.calculateVoucher("SAVE100", new BigDecimal("500000")))
                .thenReturn(new VoucherCalculation("SAVE100", new BigDecimal("100000")));
        when(paymentService.createVnPayPaymentUrl(any(Order.class), org.mockito.ArgumentMatchers.eq(servletRequest)))
                .thenReturn("https://sandbox.vnpayment.vn/discounted-payment");

        OrderResponse result = service.createOrder("user@duostyle.local", request, servletRequest);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(paymentService).createVnPayPaymentUrl(
                orderCaptor.capture(), org.mockito.ArgumentMatchers.eq(servletRequest));
        assertEquals(new BigDecimal("400000"), orderCaptor.getValue().getTotalAmount());
        assertEquals(new BigDecimal("400000"), result.getTotalAmount());
        assertEquals("https://sandbox.vnpayment.vn/discounted-payment", result.getPaymentUrl());
        verify(voucherService).calculateVoucher("SAVE100", new BigDecimal("500000"));
    }

    @Test
    void buyNowDoesNotClearExistingCart() {
        stubSuccessfulCheckout();
        int originalSize = cart.getItems().size();

        service.createOrder(
                "user@duostyle.local",
                request(CheckoutSource.BUY_NOW, PaymentMethod.COD, item(11L, 1)),
                servletRequest);

        assertEquals(originalSize, cart.getItems().size());
        assertEquals(4, firstVariant.getStockQuantity());
    }

    @Test
    void vnpayOrderKeepsStockAndCartPendingUntilReturn() {
        stubSuccessfulCheckout();
        int originalStock = firstVariant.getStockQuantity();
        when(paymentService.createVnPayPaymentUrl(any(Order.class), org.mockito.ArgumentMatchers.eq(servletRequest)))
                .thenReturn("https://sandbox.vnpayment.vn/payment");

        OrderResponse result = service.createOrder(
                "user@duostyle.local",
                request(CheckoutSource.CART, PaymentMethod.VNPAY, item(11L, 1)),
                servletRequest);

        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals("https://sandbox.vnpayment.vn/payment", result.getPaymentUrl());
        assertEquals(originalStock, firstVariant.getStockQuantity());
        assertFalse(cart.getItems().isEmpty());

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertEquals(PaymentStatus.PENDING, paymentCaptor.getValue().getStatus());
        assertEquals(CheckoutSource.CART, paymentCaptor.getValue().getOrder().getCheckoutSource());
    }

    @Test
    void emptyItemsAreRejectedBeforeSavingAnOrder() {
        stubUser();
        CreateOrderRequest request = request(CheckoutSource.CART, PaymentMethod.COD);

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createOrder("user@duostyle.local", request, servletRequest));

        assertEquals(400, exception.getStatus());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void blankDeliveryFieldsAreRejectedBeforeSavingAnOrder() {
        stubUser();
        CreateOrderRequest request = request(CheckoutSource.CART, PaymentMethod.COD, item(11L, 1));
        request.setPhone("   ");

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createOrder("user@duostyle.local", request, servletRequest));

        assertEquals(400, exception.getStatus());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void zeroQuantityIsRejectedBeforeSavingAnOrder() {
        stubUser();
        CreateOrderRequest request = request(CheckoutSource.CART, PaymentMethod.COD, item(11L, 0));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createOrder("user@duostyle.local", request, servletRequest));

        assertEquals(400, exception.getStatus());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void missingVariantIsRejectedBeforeSavingAnOrder() {
        stubUser();
        CreateOrderRequest request = request(CheckoutSource.CART, PaymentMethod.COD, item(404L, 1));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createOrder("user@duostyle.local", request, servletRequest));

        assertEquals(404, exception.getStatus());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void insufficientStockIsRejectedBeforeSavingAnOrder() {
        stubUser();
        when(entityManager.find(ProductVariant.class, 11L)).thenReturn(firstVariant);
        CreateOrderRequest request = request(CheckoutSource.CART, PaymentMethod.COD, item(11L, 6));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.createOrder("user@duostyle.local", request, servletRequest));

        assertEquals(409, exception.getStatus());
        assertEquals(5, firstVariant.getStockQuantity());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void anotherUsersOrderCodeIsNotReturned() {
        when(orderRepository.findByOrderCodeIgnoreCaseAndUserEmail("DS-PRIVATE", "user@duostyle.local"))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> service.getOrderByCode("user@duostyle.local", "DS-PRIVATE"));

        assertEquals(404, exception.getStatus());
    }

    @Test
    void userOrderHistoryContainsOnlyOrdersReturnedByTheOwnedQuery() {
        Order ownedOrder = Order.builder()
                .id(91L)
                .orderCode("DS-OWNED")
                .user(user)
                .totalAmount(new BigDecimal("250000"))
                .status(OrderStatus.PROCESSING)
                .paymentMethod(PaymentMethod.COD)
                .items(List.of())
                .build();
        when(orderRepository.findByUserEmail(
                org.mockito.ArgumentMatchers.eq("user@duostyle.local"),
                any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(ownedOrder), PageRequest.of(0, 10), 1));

        PageResponse<OrderResponse> result = service.getUserOrders("user@duostyle.local", 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals(List.of("DS-OWNED"),
                result.getContent().stream().map(OrderResponse::getOrderCode).toList());
    }

    @Test
    void mailFailureDoesNotUndoACompletedCodCheckout() {
        stubSuccessfulCheckout();
        when(cartRepository.findByUser_Email("user@duostyle.local")).thenReturn(Optional.of(cart));
        doThrow(new IllegalStateException("mail unavailable"))
                .when(emailService).sendOrderConfirmationEmail(any(), any());

        OrderResponse result = service.createOrder(
                "user@duostyle.local",
                request(CheckoutSource.CART, PaymentMethod.COD, item(11L, 1)),
                servletRequest);

        assertEquals(OrderStatus.PROCESSING, result.getStatus());
        assertEquals(4, firstVariant.getStockQuantity());
        assertTrue(cart.getItems().isEmpty());
    }

    private void stubSuccessfulCheckout() {
        stubUser();
        when(entityManager.find(ProductVariant.class, 11L)).thenReturn(firstVariant);
        doAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(91L);
            return order;
        }).when(orderRepository).save(any(Order.class));
    }

    private void stubUser() {
        when(userRepository.findByEmail("user@duostyle.local")).thenReturn(Optional.of(user));
    }

    private CreateOrderRequest request(
            CheckoutSource source,
            PaymentMethod paymentMethod,
            OrderItemRequest... items
    ) {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setShippingAddress(" 1 Nguyen Hue ");
        request.setPhone(" 0901234567 ");
        request.setPaymentMethod(paymentMethod);
        request.setCheckoutSource(source);
        request.setItems(List.of(items));
        return request;
    }

    private OrderItemRequest item(Long productVariantId, int quantity) {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductVariantId(productVariantId);
        item.setQuantity(quantity);
        return item;
    }
}
