package com.DuoStyle.DuoStyle.service.impl;

import com.DuoStyle.DuoStyle.dto.request.CreateOrderRequest;
import com.DuoStyle.DuoStyle.dto.response.MonthlySalesResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderItemResponse;
import com.DuoStyle.DuoStyle.dto.response.OrderResponse;
import com.DuoStyle.DuoStyle.dto.response.PageResponse;
import com.DuoStyle.DuoStyle.dto.response.TopProductResponse;
import com.DuoStyle.DuoStyle.entity.*;
import com.DuoStyle.DuoStyle.dto.response.VoucherCalculation;
import com.DuoStyle.DuoStyle.entity.Cart;
import com.DuoStyle.DuoStyle.entity.Order;
import com.DuoStyle.DuoStyle.entity.OrderItem;
import com.DuoStyle.DuoStyle.entity.Payment;
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
import com.DuoStyle.DuoStyle.service.OrderService;
import com.DuoStyle.DuoStyle.service.PaymentService;
import com.DuoStyle.DuoStyle.service.VoucherService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final PaymentService paymentService;
    private final VoucherService voucherService;
    private final com.DuoStyle.DuoStyle.service.EmailService emailService;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public OrderResponse createOrder(String userEmail, CreateOrderRequest request, HttpServletRequest servletRequest) {
        User user = requireUser(userEmail);
        validateRequest(request);

        String phone = request.getPhone().trim();
        String shippingAddress = request.getShippingAddress().trim();
        user.setPhone(phone);
        user.setAddress(shippingAddress);

        String orderCode = "DS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        BigDecimal subtotalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        Map<Long, Integer> requestedQuantities = new HashMap<>();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .shippingAddress(shippingAddress)
                .phone(phone)
                .paymentMethod(request.getPaymentMethod())
                .checkoutSource(request.getCheckoutSource())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        for (var itemReq : request.getItems()) {
            ProductVariant variant = entityManager.find(ProductVariant.class, itemReq.getProductVariantId());
            if (variant == null) {
                throw new CustomException(404, "Product variant not found: " + itemReq.getProductVariantId());
            }

            int accumulatedQuantity = requestedQuantities.merge(
                    variant.getId(), itemReq.getQuantity(), Integer::sum);
            int availableStock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
            if (availableStock < accumulatedQuantity) {
                throw new CustomException(409, "Insufficient stock for product variant: " + variant.getId());
            }

            BigDecimal itemTotal = variant.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotalAmount = subtotalAmount.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .size(variant.getSize() != null ? variant.getSize().name() : "FREE")
                    .color(variant.getColor())
                    .price(variant.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        String voucherCode = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            VoucherCalculation voucher = voucherService.calculateVoucher(request.getVoucherCode(), subtotalAmount);
            voucherCode = voucher.code();
            discountAmount = voucher.discountAmount();
        }

        order.setSubtotalAmount(subtotalAmount);
        order.setVoucherCode(voucherCode);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotalAmount.subtract(discountAmount).max(BigDecimal.ZERO));
        order.setItems(orderItems);
        orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        String paymentUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.COD) {
            decrementStock(orderItems);
            order.setStatus(OrderStatus.PROCESSING);
            clearCartForCartCheckout(userEmail, request.getCheckoutSource());
        } else {
            paymentUrl = paymentService.createVnPayPaymentUrl(order, servletRequest);
        }

        try {
            emailService.sendOrderConfirmationEmail(userEmail, order);
        } catch (RuntimeException exception) {
            log.warn("Order {} was created, but its confirmation email could not be sent: {}",
                    orderCode, exception.getMessage());
        }

        OrderResponse response = mapToResponse(order);
        response.setPaymentUrl(paymentUrl);
        return response;
    }

    @Override
    public PageResponse<OrderResponse> getUserOrders(String userEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findByUserEmail(requireEmail(userEmail), pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToResponse);
        return PageResponse.fromPage(responsePage);
    }

    @Override
    public OrderResponse getOrderByCode(String userEmail, String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            throw new CustomException(400, "Order code is required");
        }
        Order order = orderRepository
                .findByOrderCodeIgnoreCaseAndUserEmail(orderCode, requireEmail(userEmail))
                .orElseGet(() -> orderRepository.findByOrderCodeIgnoreCase(orderCode)
                        .orElseThrow(() -> new CustomException(404, "Order not found")));

        return mapToResponse(order);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(404, "Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
        return mapToResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByStatus(status, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        List<OrderResponse> content = orderPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(content)
                .pageNo(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    public List<MonthlySalesResponse> getMonthlySalesAnalytics(Integer year) {
        int targetYear = (year != null && year > 2000) ? year : ZonedDateTime.now().getYear();
        String[] monthNames = {"JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"};
        List<Order> allOrders = orderRepository.findAll();

        List<MonthlySalesResponse> monthlyList = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            final int currentMonth = m;
            List<Order> monthOrders = allOrders.stream()
                    .filter(o -> o.getCreatedAt() != null 
                            && o.getCreatedAt().getYear() == targetYear 
                            && o.getCreatedAt().getMonthValue() == currentMonth
                            && o.getStatus() != OrderStatus.CANCELLED)
                    .collect(Collectors.toList());

            BigDecimal revenue = monthOrders.stream()
                    .map(Order::getTotalAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            monthlyList.add(MonthlySalesResponse.builder()
                    .month(currentMonth)
                    .monthName(monthNames[currentMonth - 1])
                    .revenue(revenue)
                    .orderCount(monthOrders.size())
                    .build());
        }
        return monthlyList;
    }

    @Override
    public List<TopProductResponse> getTopSellingProducts(int limit) {
        int maxLimit = limit > 0 ? limit : 5;
        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .toList();

        Map<Long, TopProductResponse> map = new HashMap<>();

        for (Order order : validOrders) {
            if (order.getItems() == null) continue;
            for (OrderItem item : order.getItems()) {
                if (item.getProductVariant() == null || item.getProductVariant().getProduct() == null) continue;
                Product p = item.getProductVariant().getProduct();
                Long pId = p.getId();
                long qty = item.getQuantity() != null ? item.getQuantity() : 0;
                BigDecimal itemPrice = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                BigDecimal rev = itemPrice.multiply(BigDecimal.valueOf(qty));

                TopProductResponse existing = map.get(pId);
                if (existing == null) {
                    map.put(pId, TopProductResponse.builder()
                            .productId(pId)
                            .productName(p.getName())
                            .thumbnailUrl(p.getThumbnailUrl())
                            .categoryName(p.getCategory() != null ? p.getCategory().getName() : "Thời Trang")
                            .totalQuantitySold(qty)
                            .totalRevenue(rev)
                            .build());
                } else {
                    existing.setTotalQuantitySold(existing.getTotalQuantitySold() + qty);
                    existing.setTotalRevenue(existing.getTotalRevenue().add(rev));
                }
            }
        }

        return map.values().stream()
                .sorted((a, b) -> Long.compare(b.getTotalQuantitySold(), a.getTotalQuantitySold()))
                .limit(maxLimit)
                .toList();
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(requireEmail(userEmail))
                .orElseThrow(() -> new CustomException(404, "User not found"));
    }

    private String requireEmail(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new CustomException(401, "Authentication required");
        }
        return userEmail;
    }

    private void validateRequest(CreateOrderRequest request) {
        if (request == null) {
            throw new CustomException(400, "Order request is required");
        }
        if (request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
            throw new CustomException(400, "Shipping address is required");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new CustomException(400, "Phone is required");
        }
        if (request.getPaymentMethod() == null) {
            throw new CustomException(400, "Payment method is required");
        }
        if (request.getCheckoutSource() == null) {
            throw new CustomException(400, "Checkout source is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new CustomException(400, "Order items are required");
        }
        for (var item : request.getItems()) {
            if (item == null || item.getProductVariantId() == null) {
                throw new CustomException(400, "Product variant is required");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new CustomException(400, "Order item quantity must be greater than zero");
            }
        }
    }

    private void decrementStock(List<OrderItem> orderItems) {
        for (OrderItem item : orderItems) {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
        }
    }

    private void clearCartForCartCheckout(String userEmail, CheckoutSource checkoutSource) {
        if (checkoutSource != CheckoutSource.CART) {
            return;
        }
        cartRepository.findByUser_Email(userEmail)
                .map(Cart::getItems)
                .ifPresent(List::clear);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream().map(i -> {
                    String imageUrl = null;
                    Long productId = null;
                    if (i.getProductVariant() != null && i.getProductVariant().getProduct() != null) {
                        Product product = i.getProductVariant().getProduct();
                        productId = product.getId();
                        imageUrl = product.getThumbnailUrl();
                        if ((imageUrl == null || imageUrl.isBlank()) && product.getImages() != null && !product.getImages().isEmpty()) {
                            imageUrl = product.getImages().get(0).getImageUrl();
                        }
                    }
                    return OrderItemResponse.builder()
                            .id(i.getId())
                            .productId(productId)
                            .productName(i.getProductName())
                            .imageUrl(imageUrl)
                            .size(i.getSize())
                            .color(i.getColor())
                            .price(i.getPrice())
                            .quantity(i.getQuantity())
                            .build();
                }).toList() : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .subtotalAmount(order.getSubtotalAmount())
                .voucherCode(order.getVoucherCode())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
